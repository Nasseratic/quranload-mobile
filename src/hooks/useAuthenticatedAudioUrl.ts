import { useEffect, useState, useRef } from "react";
import { File, Directory, Paths } from "expo-file-system/next";

// Cache directory for downloaded audio files
const audioDir = new Directory(Paths.cache, "audio");

// Track active downloads to allow cancellation
const activeDownloads = new Map<string, AbortController>();

/**
 * Generate a cache filename from a URL
 */
const getCacheFilename = (url: string): string => {
  // Extract filename from URL, or create hash if not available
  const urlPath = url.split("?")[0];
  const filename = urlPath.split("/").pop() || "";

  // Simple hash for URL uniqueness
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  // Extract extension or default to .m4a
  const ext = filename.match(/\.(m4a|mp4|mp3|wav|aac)$/i)?.[0] || ".m4a";
  return `${Math.abs(hash).toString(16)}${ext}`;
};

/**
 * Ensure the audio cache directory exists
 */
const ensureAudioDir = (): void => {
  if (!audioDir.exists) {
    audioDir.create();
  }
};

/**
 * Download an audio file with optional authentication headers and progress tracking.
 *
 * Note: Azure SAS URLs (pre-signed) don't need Authorization headers.
 * Adding auth headers to a SAS URL causes HTTP 400 errors.
 */
const downloadAuthenticatedAudio = async (
  url: string,
  localFile: File,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal
): Promise<string> => {
  // Don't add Authorization headers - Azure URLs are pre-signed SAS URLs
  // that already have authentication in the URL query parameters.
  // Adding a Bearer token to a SAS URL causes HTTP 400 errors.
  const response = await fetch(url, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    if (total > 0 && onProgress) {
      const progress = (receivedLength / total) * 100;
      onProgress(progress);
    }
  }

  // Combine all chunks into a single Uint8Array
  const allChunks = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  // Write to file
  localFile.create();
  localFile.write(allChunks);

  return localFile.uri;
};

/**
 * Hook to download and cache audio files that require authentication.
 *
 * This is necessary because expo-audio's useAudioPlayer doesn't support
 * passing custom headers (like Authorization). Azure storage URLs require
 * Bearer token authentication, so we need to download the file first
 * and then play from the local cache.
 *
 * @param url - The authenticated URL to download (or undefined/null)
 * @returns Object with localUri (cached file path), loading state, progress (0-100), and error
 */
export const useAuthenticatedAudioUrl = (url: string | undefined | null | false) => {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Track mounted state to avoid state updates after unmount
  const isMountedRef = useRef(true);
  const urlRef = useRef(url);
  urlRef.current = url;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!url) {
      setLocalUri(null);
      setError(null);
      setProgress(0);
      return;
    }

    // Cancel any existing download for this URL
    const existingController = activeDownloads.get(url);
    if (existingController) {
      existingController.abort();
    }

    const abortController = new AbortController();
    activeDownloads.set(url, abortController);

    const downloadAndCache = async () => {
      const filename = getCacheFilename(url);

      try {
        ensureAudioDir();
        const localFile = new File(audioDir, filename);

        // Check if already cached
        if (localFile.exists) {
          if (isMountedRef.current && urlRef.current === url) {
            setLocalUri(localFile.uri);
            setIsLoading(false);
            setProgress(100);
          }
          activeDownloads.delete(url);
          return;
        }

        // Not cached, need to download
        if (isMountedRef.current && urlRef.current === url) {
          setIsLoading(true);
          setError(null);
          setProgress(0);
        }

        const downloadedUri = await downloadAuthenticatedAudio(
          url,
          localFile,
          (p) => {
            if (isMountedRef.current && urlRef.current === url) {
              setProgress(Math.floor(p));
            }
          },
          abortController.signal
        );

        if (isMountedRef.current && urlRef.current === url) {
          setLocalUri(downloadedUri);
          setIsLoading(false);
          setProgress(100);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("[useAuthenticatedAudioUrl] Download error:", err);
        if (isMountedRef.current && urlRef.current === url) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
          setProgress(0);
          setLocalUri(null);
        }
      } finally {
        activeDownloads.delete(url);
      }
    };

    downloadAndCache();

    return () => {
      abortController.abort();
      activeDownloads.delete(url);
    };
  }, [url]);

  return { localUri, isLoading, progress, error };
};

/**
 * Clear the audio cache (useful for debugging or freeing storage)
 */
export const clearAudioCache = (): void => {
  if (audioDir.exists) {
    audioDir.delete();
  }
};
