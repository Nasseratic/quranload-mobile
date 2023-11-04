import apiClient from "api/apiClient";
import { Media_Dto_MediaDto } from "__generated/apiTypes/models/Media_Dto_MediaDto";
import { BASE_URL } from "api/apiClient";

type MediaResponse = Pick<Required<Media_Dto_MediaDto>, "id" | "uri">;

export const uploadFile = async (formData: { uri: string }) => {
  const form = new FormData();
  form.append("File", {
    uri: formData.uri,
    name: "attachment.mp3",
    type: "audio/mpeg",
  });
  form.append("MediaType", "2");
  return apiClient.post<MediaResponse>("Media", form);
};

export const getMediaUri = (id: string) => `${BASE_URL}Media/${id}?filename=Assignment/${id}`;
