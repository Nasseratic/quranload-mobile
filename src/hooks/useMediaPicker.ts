import { MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { MediaResponse, getMediaUri, uploadFile } from "services/mediaService";
import { isNotNullish } from "utils/notNullish";

export const useMediaPicker = ({
  initialRemoteMedia,
}: { initialRemoteMedia?: MediaResponse[] } = {}) => {
  const { mutateAsync, isLoading } = useMutation({
    mutationKey: ["media"],
    mutationFn: uploadFile,
  });

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

  const uploadSelectedMedia = () =>
    Promise.all(
      images.map((uri) =>
        uri.startsWith("http")
          ? Promise.resolve(initialRemoteMedia?.find((media) => getMediaUri(media.id) === uri))
          : mutateAsync({ uri })
      )
    );

  return { pickImage, images, removeImage, uploadSelectedMedia, isUploading: isLoading };
};
