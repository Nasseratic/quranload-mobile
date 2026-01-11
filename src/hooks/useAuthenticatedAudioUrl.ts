import { useEffect, useState, useRef } from "react";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cache directory for downloaded audio files
const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio/`;

/**
 * Generate a cache key from a URL by hashing it
 */
const getCacheKey = (url: string): string => {
  // Simple hash function for URL -> filename
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Get the local file path for a cached audio URL
 */
const getCacheFilePath = (url: string): string => {
  const key = getCacheKey(url);
  // Extract extension from URL or default to .m4a
  const urlPath = url.split("?")[0];
  const ext = urlPath.match(/\.(m4a|mp4|mp3|wav|aac)$/i)?.[0] || ".m4a";
  return `${AUDIO_CACHE_DIR}${key}${ext}`;
};

/**
 * Ensure the audio cache directory exists
 */
const ensureCacheDir = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
  }
};

/**
 * Download an audio file with authentication headers
 */
const downloadAuthenticatedAudio = async (
  url: string,
  localPath: string
): Promise<string> => {
  const token = await AsyncStorage.getItem("accessToken");

  const downloadResult = await FileSystem.downloadAsync(url, localPath, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (downloadResult.status !== 200) {
    // Clean up failed download
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localPath, { idempotent: true });
    }
    throw new Error(`Failed to download audio: HTTP ${downloadResult.status}`);
  }

  return downloadResult.uri;
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
 * @returns Object with localUri (cached file path) and loading/error states
 */
export const useAuthenticatedAudioUrl = (url: string | undefined | null) => {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track mounted state to avoid state updates after unmount
  const isMountedRef = useRef(true);

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
      return;
    }

    let cancelled = false;

    const downloadAndCache = async () => {
      const cachePath = getCacheFilePath(url);

      try {
        // Check if already cached
        const cacheInfo = await FileSystem.getInfoAsync(cachePath);
        if (cacheInfo.exists && cacheInfo.size && cacheInfo.size > 0) {
          if (!cancelled && isMountedRef.current) {
            setLocalUri(cachePath);
            setIsLoading(false);
          }
          return;
        }

        // Not cached, need to download
        if (!cancelled && isMountedRef.current) {
          setIsLoading(true);
          setError(null);
        }

        await ensureCacheDir();
        const downloadedUri = await downloadAuthenticatedAudio(url, cachePath);

        if (!cancelled && isMountedRef.current) {
          setLocalUri(downloadedUri);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[useAuthenticatedAudioUrl] Download error:", err);
        if (!cancelled && isMountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
          setLocalUri(null);
        }
      }
    };

    downloadAndCache();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { localUri, isLoading, error };
};

/**
 * Clear the audio cache (useful for debugging or freeing storage)
 */
export const clearAudioCache = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(AUDIO_CACHE_DIR, { idempotent: true });
  }
};
