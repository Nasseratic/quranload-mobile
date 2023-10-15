import apiClient from "api/apiClient";
import qs from "qs";
import Paginated from "types/Paginated";
import { AssignmentStatusEnum } from "types/Lessons";
import { BASE_URL } from "api/apiClient";

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

export const deleteLessonSubmission = async (body: { lessonId: string; studentId: string }) =>
  apiClient.delete("LessonSubmission/recording", body);

export const getRecordingUrl = ({
  lessonId,
  recordingId,
}: {
  lessonId: string;
  recordingId: string;
}) => `${BASE_URL}LessonSubmission/recording/file?LessonId=${lessonId}&FileName=${recordingId}`;

export const getFeedbackUrl = ({
  lessonId,
  feedbackId,
  studentId,
}: {
  lessonId: string;
  feedbackId: string;
  studentId: string;
}) => {
  return `${BASE_URL}LessonSubmission/feedback/file?LessonId=${lessonId}&FileName=${feedbackId}&StudentId=${studentId}`;
};
