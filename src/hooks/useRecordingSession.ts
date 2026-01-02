import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useCvxMutation, useCvxQuery } from "api/convex";
import { api } from "../../convex/_generated/api";
import { useUploadFile } from "@convex-dev/r2/react";
import { useFragmentUploadQueue } from "utils/fragmentUploadQueue";
import { AssignmentStatusEnum } from "types/Lessons";
import { toast } from "components/Toast";
import { Sentry } from "utils/sentry";

export type RecordingState = "idle" | "recording" | "paused" | "submitting";

// Map Convex session status to UI recording state
type ConvexSessionStatus =
  | "recording"
  | "paused"
  | "finalizing"
  | "processing"
  | "completed"
  | "failed";

const mapConvexStatusToRecordingState = (
  status: ConvexSessionStatus | undefined
): RecordingState => {
  if (!status) return "idle";
  switch (status) {
    case "recording":
      return "recording";
    case "paused":
      return "paused";
    case "finalizing":
    case "processing":
      return "submitting";
    case "completed":
    case "failed":
      return "idle";
    default:
      return "idle";
  }
};

// Type for Convex session data
interface ConvexSession {
  _id: string;
  sessionId: string;
  userId: string;
  status: ConvexSessionStatus;
  isActive: boolean;
  uploadType?: "media_only" | "lesson_submission" | "feedback_submission";
  lessonId?: string;
  studentId?: string;
  lessonState?: number;
  totalDuration: number;
  fragmentsCount: number;
  finalAudioKey?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UseRecordingSessionOptions {
  userId: string;
  lessonId?: string;
  studentId?: string;
  uploadType?: "feedback_submission" | "lesson_submission" | "media_only";
  lessonState?: AssignmentStatusEnum;
  onServerSubmitSuccess?: (filename?: string) => void;
}

export interface UseRecordingSessionReturn {
  // State from Convex
  sessionId: string | null;
  status: RecordingState;

  // Durations (in ms)
  committedDuration: number;
  pendingDuration: number;
  totalDuration: number; // committed + pending

  fragmentsCount: number;

  // Upload queue state
  pendingUploads: number;
  isUploading: boolean;

  // Processing state - true when all uploads done and audio is being processed
  isProcessingAudio: boolean;

  // Actions
  startSession: () => Promise<string>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  submitSession: () => Promise<void>;
  discardSession: () => Promise<void>;
  queueFragment: (uri: string, duration: number) => void;

  // Recovery
  recoverableSession: ConvexSession | null;
  recoverSession: () => void;
  dismissRecovery: () => Promise<void>;
}

// Generate unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Hook for managing recording sessions with Convex as the source of truth
 */
export function useRecordingSession(
  options: UseRecordingSessionOptions
): UseRecordingSessionReturn {
  const { userId, lessonId, studentId, uploadType, lessonState, onServerSubmitSuccess } = options;

  // Local state for active session ID
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Track fragment index locally to prevent collisions during rapid updates
  const nextFragmentIndexRef = useRef(0);

  // Convex mutations
  const createSessionMutation = useCvxMutation(api.services.recordings.createSession);
  const updateSessionStatusMutation = useCvxMutation(api.services.recordings.updateSessionStatus);
  const addFragmentMutation = useCvxMutation(api.services.recordings.addFragment);
  const deleteSessionMutation = useCvxMutation(api.services.recordings.deleteSession);

  // R2 upload hook
  const uploadFile = useUploadFile(api.services.recordings);

  // Query for active session (current or recoverable)
  const activeSessionQuery = useCvxQuery(api.services.recordings.getActiveSessionForLesson, {
    userId,
    lessonId,
  });

  // Query for current session details (reactive updates)
  const currentSessionQuery = useCvxQuery(
    api.services.recordings.getSession,
    activeSessionId ? { sessionId: activeSessionId } : "skip"
  );

  // Fragment upload queue
  const fragmentQueue = useFragmentUploadQueue({
    uploadFile,
    addFragmentMutation,
    onUploadError: (fragment, error) => {
      toast.show({
        title: "Fragment upload failed",
        status: "Warning",
      });
      Sentry.captureException(error, {
        extra: { fragmentId: fragment.id, sessionId: fragment.sessionId },
      });
    },
  });

  // Derive session data from Convex
  const sessionData = currentSessionQuery;
  const status: RecordingState = mapConvexStatusToRecordingState(sessionData?.status);
  const committedDuration = sessionData?.totalDuration ?? 0;
  const fragmentsCount = sessionData?.fragmentsCount ?? 0;

  // Check if audio is being processed (all uploads done, waiting for server processing)
  const isProcessingAudio =
    status === "submitting" && fragmentQueue.pendingCount === 0 && !fragmentQueue.isProcessing;

  // Sync local fragment index with server (only if server is ahead, to prevent collisions)
  useEffect(() => {
    if (sessionData?.fragmentsCount !== undefined) {
      nextFragmentIndexRef.current = Math.max(
        nextFragmentIndexRef.current,
        sessionData.fragmentsCount
      );
    }
  }, [sessionData?.fragmentsCount]);

  // Calculate pending duration from the upload queue
  const pendingDuration = useMemo(() => {
    if (!activeSessionId) return 0;
    return fragmentQueue.queue
      .filter((f) => f.sessionId === activeSessionId)
      .reduce((total, fragment) => total + fragment.duration, 0);
  }, [fragmentQueue.queue, activeSessionId]);

  // Determine if there's a recoverable session
  const recoverableSession = useMemo((): ConvexSession | null => {
    // If we have an active local session, we don't look for recovery
    if (activeSessionId) return null;
    if (!activeSessionQuery) return null;

    // Only show recovery if session is in a recoverable state
    const recoverableStatuses: ConvexSessionStatus[] = ["recording", "paused"];
    if (recoverableStatuses.includes(activeSessionQuery.status)) {
      return activeSessionQuery as ConvexSession;
    }
    return null;
  }, [activeSessionQuery, activeSessionId]);

  // Auto-adopt processing sessions (finalizing/processing) so UI shows processing state
  useEffect(() => {
    if (activeSessionId) return; // Already have an active session
    if (!activeSessionQuery) return;

    const processingStatuses: ConvexSessionStatus[] = ["finalizing", "processing"];
    if (processingStatuses.includes(activeSessionQuery.status)) {
      // Automatically adopt this session to show processing state in UI
      setActiveSessionId(activeSessionQuery.sessionId);
      nextFragmentIndexRef.current = activeSessionQuery.fragmentsCount;
    }
  }, [activeSessionQuery, activeSessionId]);

  // Handle session completion/failure reactively
  useEffect(() => {
    if (sessionData) {
      if (sessionData.status === "completed") {
        onServerSubmitSuccess?.(sessionData.finalAudioKey);
        setActiveSessionId(null);
        fragmentQueue.clearSession(sessionData.sessionId);
        // Reset local index
        nextFragmentIndexRef.current = 0;
      } else if (sessionData.status === "failed") {
        toast.show({
          title: "Processing failed",
          status: "Error",
        });
        setActiveSessionId(null);
        nextFragmentIndexRef.current = 0;
      }
    }
  }, [sessionData?.status, sessionData?.finalAudioKey, sessionData?.sessionId]);

  // Start a new session
  const startSession = useCallback(async (): Promise<string> => {
    const sessionId = generateSessionId();
    nextFragmentIndexRef.current = 0; // Reset index for new session

    try {
      await createSessionMutation({
        sessionId,
        userId,
        uploadType,
        lessonId,
        studentId,
        lessonState,
      });

      setActiveSessionId(sessionId);
      return sessionId;
    } catch (error) {
      toast.show({
        title: "Failed to create recording session",
        status: "Error",
      });
      throw error;
    }
  }, [userId, uploadType, lessonId, studentId, lessonState, createSessionMutation]);

  // Pause the current session
  const pauseSession = useCallback(async (): Promise<void> => {
    if (!activeSessionId) return;

    try {
      await updateSessionStatusMutation({
        sessionId: activeSessionId,
        status: "paused",
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [activeSessionId, updateSessionStatusMutation]);

  // Resume recording (update status to recording)
  const resumeSession = useCallback(async (): Promise<void> => {
    if (!activeSessionId) return;

    try {
      await updateSessionStatusMutation({
        sessionId: activeSessionId,
        status: "recording",
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [activeSessionId, updateSessionStatusMutation]);

  // Submit the session for finalization
  const submitSession = useCallback(async (): Promise<void> => {
    if (!activeSessionId) {
      toast.show({
        title: "No recording session found",
        status: "Error",
      });
      return;
    }

    try {
      await updateSessionStatusMutation({
        sessionId: activeSessionId,
        status: "finalizing",
      });
      // The useEffect above will catch status change to "completed"
    } catch (error) {
      toast.show({
        title: "Submit trigger failed",
        status: "Error",
      });
      Sentry.captureException(error);
    }
  }, [activeSessionId, updateSessionStatusMutation]);

  // Discard the current session
  const discardSession = useCallback(async (): Promise<void> => {
    const sessionToDiscard = activeSessionId;
    if (!sessionToDiscard) return;

    // Clear local state immediately to prevent duplicate calls
    setActiveSessionId(null);
    nextFragmentIndexRef.current = 0;

    try {
      await fragmentQueue.clearSession(sessionToDiscard);
      await deleteSessionMutation({ sessionId: sessionToDiscard });
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [activeSessionId, deleteSessionMutation, fragmentQueue]);

  // Queue a fragment for upload
  const queueFragment = useCallback(
    (uri: string, duration: number): void => {
      if (!activeSessionId) return;

      // Use local ref for index to prevent duplicates/collisions
      const index = nextFragmentIndexRef.current;
      nextFragmentIndexRef.current += 1;

      fragmentQueue.enqueue({
        sessionId: activeSessionId,
        fragmentIndex: index,
        localUri: uri,
        duration,
      });
    },
    [activeSessionId, fragmentQueue]
  );

  // Recover an existing session
  const recoverSession = useCallback((): void => {
    if (recoverableSession) {
      setActiveSessionId(recoverableSession.sessionId);
      nextFragmentIndexRef.current = recoverableSession.fragmentsCount;
      // Restore any pending uploads for this session
      fragmentQueue.restoreQueue();
    }
  }, [recoverableSession, fragmentQueue]);

  // Dismiss recovery (discard the recoverable session)
  const dismissRecovery = useCallback(async (): Promise<void> => {
    if (recoverableSession) {
      try {
        await fragmentQueue.clearSession(recoverableSession.sessionId);
        await deleteSessionMutation({ sessionId: recoverableSession.sessionId });
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }, [recoverableSession, deleteSessionMutation, fragmentQueue]);

  return {
    sessionId: activeSessionId,
    status,
    committedDuration,
    pendingDuration,
    totalDuration: committedDuration + pendingDuration,
    fragmentsCount,
    pendingUploads: fragmentQueue.pendingCount,
    isUploading: fragmentQueue.isProcessing,
    isProcessingAudio,
    startSession,
    pauseSession,
    resumeSession,
    submitSession,
    discardSession,
    queueFragment,
    recoverableSession,
    recoverSession,
    dismissRecovery,
  };
}
