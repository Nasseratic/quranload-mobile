import apiClient from "api/apiClient";
import qs from "qs";
import Paginated from "types/Paginated";
import { AssignmentStatusEnum } from "types/Lessons";

export const fetchUserLessons = async (data: {
  teamId: string;
  lessonState?: AssignmentStatusEnum;
  pageNumber?: number;
  pageSize?: number;
}): Promise<Paginated<Frontend.Content.Assignment>> => {
  return await apiClient.get<Paginated<Frontend.Content.Assignment>>(
    `lessons?${qs.stringify(data)}`
  );
};

export const submitLessonRecording = async ({
  file,
  duration,
  lessonId,
}: {
  file: {
    uri: string;
    name: string;
    type: string;
  };
  lessonId: string;
  duration: number;
}) => {
  const form = new FormData();
  form.append("Recording", file);
  form.append("LessonId", lessonId);
  form.append("RecordingDuration", `${duration}`);

  return apiClient.post("LessonSubmission/recording", form);
};
