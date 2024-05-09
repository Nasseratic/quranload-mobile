import { MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { uploadFile } from "services/mediaService";

export const useMediaPicker = () => {
  const { mutateAsync, isLoading } = useMutation({
    mutationKey: ["media"],
    mutationFn: uploadFile,
  });

  const [images, setImages] = useState<string[]>([]);

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

  const uploadSelectedMedia = () => Promise.all(images.map((uri) => mutateAsync({ uri })));

  return { pickImage, images, removeImage, uploadSelectedMedia, isUploading: isLoading };
};
