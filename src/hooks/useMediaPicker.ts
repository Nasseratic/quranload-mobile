import { MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { uploadChatMedia } from "utils/uploadChatMedia";
import { MediaResponse, getMediaUri, uploadFile } from "services/mediaService";
import { isNotNullish } from "utils/notNullish";

export type MediaItem = {
  uri: string;
  type: "image" | "video";
};

/**
 * Hook for uploading chat media (images and optionally videos) to R2 storage via Convex
 * @param allowVideos - Whether to allow video selection (only for support chat)
 */
export const useChatMediaUploader = ({
  initialRemoteMedia,
  allowVideos = false,
}: { initialRemoteMedia?: MediaResponse[]; allowVideos?: boolean } = {}) => {
  const picker = useMediaPicker({ initialRemoteMedia, allowVideos });

  const uploadChatMediaItems = async () => {
    // Capture the items before clearing
    const itemsToUpload = [...picker.mediaItems];
    const uploadResults = await Promise.all(
      itemsToUpload.map((item) => uploadChatMedia(item.uri, item.type))
    );
    picker.setMediaItems([]);
    return uploadResults.map((key, index) =>
      key ? { key, type: itemsToUpload[index].type } : null
    );
  };

  const {
    mutateAsync: upload,
    isPending,
    error,
  } = useMutation({
    mutationKey: ["chatMedia"],
    mutationFn: uploadChatMediaItems,
  });

  if (error) {
    console.error("Chat media upload error:", error);
  }

  return {
    ...picker,
    isUploading: isPending,
    upload,
  };
};

export const useMediaUploader = ({
  initialRemoteMedia,
}: { initialRemoteMedia?: MediaResponse[] } = {}) => {
  const picker = useMediaPicker({ initialRemoteMedia });
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["media"],
    mutationFn: uploadFile,
  });

  const uploadSelectedMedia = async () => {
    let images = [];
    for (const uri of picker.images) {
      images.push(
        await (uri.startsWith("http")
          ? Promise.resolve(initialRemoteMedia?.find((media) => getMediaUri(media.id) === uri))
          : mutateAsync({ uri }))
      );
    }
    return images;
  };

  return {
    ...picker,
    uploadSelectedMedia,
    isUploading: isPending,
  };
};

const useMediaPicker = ({
  initialRemoteMedia,
  allowVideos = false,
}: { initialRemoteMedia?: MediaResponse[]; allowVideos?: boolean } = {}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    initialRemoteMedia?.map((media) => {
      const uri = getMediaUri(media.id);
      return uri ? { uri, type: "image" as const } : null;
    }).filter(isNotNullish) ?? []
  );

  // Legacy support: images array for backwards compatibility
  const images = mediaItems.filter((item) => item.type === "image").map((item) => item.uri);

  const pickMedia = useCallback(async () => {
    const { assets } = await launchImageLibraryAsync({
      mediaTypes: allowVideos ? MediaTypeOptions.All : MediaTypeOptions.Images,
      quality: 0.2,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      videoQuality: 1,
      videoMaxDuration: 120, // 2 minutes max for videos
    });

    if (assets) {
      const newItems: MediaItem[] = assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === "video" ? ("video" as const) : ("image" as const),
      }));
      setMediaItems((items) => [...items, ...newItems]);
    }
  }, [allowVideos]);

  const removeMedia = useCallback((uri: string) => {
    setMediaItems((items) => items.filter((item) => item.uri !== uri));
  }, []);

  // Legacy support
  const setImages = useCallback((uris: string[]) => {
    setMediaItems(uris.map((uri) => ({ uri, type: "image" as const })));
  }, []);

  const removeImage = removeMedia;
  const pickImage = pickMedia;

  return {
    mediaItems,
    setMediaItems,
    pickMedia,
    removeMedia,
    // Legacy support
    images,
    setImages,
    pickImage,
    removeImage,
  };
};
