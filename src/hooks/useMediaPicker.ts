import { MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { uploadChatMedia } from "utils/uploadChatMedia";
import { MediaResponse, getMediaUri, uploadFile } from "services/mediaService";
import { isNotNullish } from "utils/notNullish";

export const useSupabaseMediaUploader = ({
  initialRemoteMedia,
}: { initialRemoteMedia?: MediaResponse[] } = {}) => {
  const picker = useMediaPicker({ initialRemoteMedia });

  const supabaseUploadChatImages = async () => {
    const uploadImages = await Promise.all(
      picker.images.map((uri) => uploadChatMedia(uri, "image"))
    );
    picker.setImages([]);
    return uploadImages;
  };

  const {
    mutateAsync: upload,
    isPending,
    error,
  } = useMutation({
    mutationKey: ["media"],
    mutationFn: supabaseUploadChatImages,
  });
  console.log(error);

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

const useMediaPicker = ({ initialRemoteMedia }: { initialRemoteMedia?: MediaResponse[] } = {}) => {
  const [images, setImages] = useState<string[]>(
    initialRemoteMedia?.map((media) => getMediaUri(media.id)).filter(isNotNullish) ?? []
  );

  const pickImage = async () => {
    const { assets } = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      quality: 0.2,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (assets) {
      setImages((images) => [...images, ...assets.map((asset) => asset.uri)]);
    }
  };

  const removeImage = (image: string) => setImages((images) => images.filter((i) => i !== image));

  return {
    setImages,
    pickImage,
    images,
    removeImage,
  };
};
