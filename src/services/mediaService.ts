import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { Id } from "api/convex";
import { IS_ANDROID } from "constants/GeneralConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type MediaResponse = {
  id: string;
  uri: string;
};

declare global {
  interface FormData {
    append(name: string, value: FormDataValue, fileName?: string): void;
  }
}

export const uploadFile = async (formData: { uri: string }): Promise<MediaResponse> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  let uploadedBy: Id<"users"> | undefined;

  if (refreshToken) {
    const user = await client.query(api.services.auth.getCurrentUser, { refreshToken });
    if (user) {
      uploadedBy = user.id as Id<"users">;
    }
  }

  // Get upload URL from Convex
  const uploadUrl = await client.mutation(api.services.media.generateUploadUrl, {});

  // Upload the file
  const response = await fetch(formData.uri);
  const blob = await response.blob();

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": IS_ANDROID ? "image/jpeg" : "image/png",
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file");
  }

  const { storageId } = await uploadResponse.json();

  // Register the media in Convex
  const result = await client.mutation(api.services.media.uploadMedia, {
    fileId: storageId,
    mediaType: 1, // Image
    uploadedBy,
  });

  return {
    id: result.id,
    uri: result.uri ?? "",
  };
};

export const getMediaUri = async (id: string): Promise<string> => {
  const result = await client.query(api.services.media.getMediaUrl, {
    mediaId: id as Id<"media">,
  });

  return result?.url ?? "";
};
