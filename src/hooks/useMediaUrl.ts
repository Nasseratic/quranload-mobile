import { useEffect, useState } from "react";
import { client } from "api/convex";
import { api } from "../../convex/_generated/api";

// Cache for resolved URLs to avoid redundant calls
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (URLs expire in 1 hour)

/**
 * Resolve an R2 storage key to a signed URL
 * Returns the URL from cache if available and not expired
 */
export const resolveMediaKey = async (key: string): Promise<string | null> => {
  // Check cache first
  const cached = urlCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storageApi = api.services.storage as any;
    const url = await client.action(storageApi.getUrl, { key });

    // Cache the result
    urlCache.set(key, {
      url,
      expiresAt: Date.now() + CACHE_DURATION,
    });

    return url;
  } catch (e) {
    console.error("[resolveMediaKey] Error resolving key:", key, e);
    return null;
  }
};

/**
 * Hook to resolve a media key to a URL
 * Handles caching and loading states
 */
export const useMediaUrl = (mediaKey: string | undefined | null) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mediaKey) {
      setUrl(null);
      return;
    }

    // Check cache first
    const cached = urlCache.get(mediaKey);
    if (cached && cached.expiresAt > Date.now()) {
      setUrl(cached.url);
      return;
    }

    setIsLoading(true);
    resolveMediaKey(mediaKey)
      .then(setUrl)
      .finally(() => setIsLoading(false));
  }, [mediaKey]);

  return { url, isLoading };
};
