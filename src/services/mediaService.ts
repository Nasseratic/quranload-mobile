import apiClient from "api/apiClient";
import { Media_Dto_MediaDto } from "__generated/apiTypes/models/Media_Dto_MediaDto";
import { BASE_URL } from "api/apiClient";
import { IS_ANDROID } from "constants/GeneralConstants";

type MediaResponse = Pick<Required<Media_Dto_MediaDto>, "id" | "uri">;

declare global {
  interface FormData {
    append(name: string, value: FormDataValue, fileName?: string): void;
  }
}

export const uploadFile = async (formData: { uri: string }) => {
  const form = new FormData();
  form.append("File", {
    uri: formData.uri,
    name: "file",
    type: IS_ANDROID ? "image/jpeg" : "png",
  });
  form.append("MediaType", "2");
  return apiClient.postForm<MediaResponse>("Media", form);
};

export const getMediaUri = (id: string) => `${BASE_URL}Media/${id}?filename=Assignment/${id}`;
