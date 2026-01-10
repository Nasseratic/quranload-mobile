import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Sentry } from "utils/sentry";

const STORAGE_KEY = "fragmentUploadQueue";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

export interface QueuedFragment {
  id: string;
  sessionId: string;
  fragmentIndex: number;
  localUri: string;
  duration: number;
  status: "pending" | "uploading" | "failed";
  retryCount: number;
  createdAt: number;
}

interface AddFragmentArgs {
  sessionId: string;
  fragmentIndex: number;
  r2Key: string;
  duration: number;
}

interface UseFragmentUploadQueueOptions {
  uploadFile: (file: File) => Promise<string>;
  addFragmentMutation: (args: AddFragmentArgs) => Promise<unknown>;
  onUploadComplete?: (fragment: QueuedFragment, r2Key: string) => void;
  onUploadError?: (fragment: QueuedFragment, error: unknown) => void;
}

interface UseFragmentUploadQueueReturn {
  queue: QueuedFragment[];
  pendingCount: number;
  isProcessing: boolean;
  enqueue: (fragment: Omit<QueuedFragment, "id" | "status" | "retryCount" | "createdAt">) => void;
  clearSession: (sessionId: string) => Promise<void>;
  restoreQueue: () => Promise<void>;
}

/**
 * Hook for managing offline-resilient fragment uploads
 * Fragments are queued locally and uploaded to R2 when possible
 */
export function useFragmentUploadQueue(
  options: UseFragmentUploadQueueOptions
): UseFragmentUploadQueueReturn {
  const [queue, setQueue] = useState<QueuedFragment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const optionsRef = useRef(options);

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Persist queue to AsyncStorage whenever it changes
  useEffect(() => {
    const persistQueue = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      } catch (error) {
        Sentry.captureException(error);
      }
    };
    persistQueue();
  }, [queue]);

  // Restore queue from AsyncStorage on mount
  const restoreQueue = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QueuedFragment[];
        // Reset any "uploading" status to "pending" (interrupted uploads)
        const restored = parsed.map((f) => ({
          ...f,
          status: f.status === "uploading" ? ("pending" as const) : f.status,
        }));
        setQueue(restored);
      }
    } catch (error) {
      Sentry.captureException(error);
      // Clear corrupted data
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Enqueue a new fragment
  const enqueue = useCallback(
    (fragment: Omit<QueuedFragment, "id" | "status" | "retryCount" | "createdAt">) => {
      const newFragment: QueuedFragment = {
        ...fragment,
        id: `${fragment.sessionId}_${fragment.fragmentIndex}_${Date.now()}`,
        status: "pending",
        retryCount: 0,
        createdAt: Date.now(),
      };
      setQueue((prev) => [...prev, newFragment]);
    },
    []
  );

  // Clear all fragments for a session
  const clearSession = useCallback(async (sessionId: string) => {
    setQueue((prev) => prev.filter((f) => f.sessionId !== sessionId));
  }, []);

  // Process a single fragment
  const processFragment = useCallback(async (fragment: QueuedFragment): Promise<boolean> => {
    try {
      // Update status to uploading
      setQueue((prev) =>
        prev.map((f) => (f.id === fragment.id ? { ...f, status: "uploading" as const } : f))
      );

      // Fetch blob from local file URI
      const response = await fetch(fragment.localUri);
      const blob = await response.blob();

      // Create a File object
      const fileName = `fragment_${fragment.fragmentIndex}.m4a`;
      const file = new File([blob], fileName, { type: "audio/x-m4a" });

      // Upload to R2
      const r2Key = await optionsRef.current.uploadFile(file);

      // Add fragment metadata to Convex
      await optionsRef.current.addFragmentMutation({
        sessionId: fragment.sessionId,
        fragmentIndex: fragment.fragmentIndex,
        r2Key,
        duration: fragment.duration,
      });

      // Remove from queue on success
      setQueue((prev) => prev.filter((f) => f.id !== fragment.id));

      optionsRef.current.onUploadComplete?.(fragment, r2Key);
      return true;
    } catch (error) {
      const newRetryCount = fragment.retryCount + 1;

      if (newRetryCount >= MAX_RETRIES) {
        // Mark as permanently failed
        setQueue((prev) =>
          prev.map((f) =>
            f.id === fragment.id
              ? { ...f, status: "failed" as const, retryCount: newRetryCount }
              : f
          )
        );
        Sentry.captureException(error, {
          extra: {
            fragmentId: fragment.id,
            sessionId: fragment.sessionId,
            fragmentIndex: fragment.fragmentIndex,
          },
        });
        optionsRef.current.onUploadError?.(fragment, error);
      } else {
        // Mark as pending for retry
        setQueue((prev) =>
          prev.map((f) =>
            f.id === fragment.id
              ? { ...f, status: "pending" as const, retryCount: newRetryCount }
              : f
          )
        );
      }
      return false;
    }
  }, []);

  // Process the queue
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      // Get pending fragments, sorted by creation time
      const pendingFragments = queue
        .filter((f) => f.status === "pending")
        .sort((a, b) => a.createdAt - b.createdAt);

      for (const fragment of pendingFragments) {
        const success = await processFragment(fragment);
        if (!success && fragment.retryCount < MAX_RETRIES) {
          // Wait before retry
          const delay = RETRY_DELAYS[fragment.retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [queue, processFragment]);

  // Auto-process queue when there are pending items
  useEffect(() => {
    const hasPending = queue.some((f) => f.status === "pending");
    if (hasPending && !processingRef.current) {
      processQueue();
    }
  }, [queue, processQueue]);

  // Restore queue on mount
  useEffect(() => {
    restoreQueue();
  }, [restoreQueue]);

  const pendingCount = queue.filter(
    (f) => f.status === "pending" || f.status === "uploading"
  ).length;

  return {
    queue,
    pendingCount,
    isProcessing,
    enqueue,
    clearSession,
    restoreQueue,
  };
}
