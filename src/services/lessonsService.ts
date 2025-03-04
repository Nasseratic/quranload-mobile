import apiClient from "api/apiClient";
import qs from "qs";
import Paginated from "types/Paginated";
import { AssignmentStatusEnum } from "types/Lessons";
import { BASE_URL } from "api/apiClient";
import {
  Lessons_Dto_LessonDetailResponse,
  Lessons_Dto_LessonGetResponse,
} from "__generated/apiTypes";

export const fetchUserLessons = async (data: {
  teamId: string;
  lessonState?: AssignmentStatusEnum;
  pageNumber?: number;
  pageSize?: number;
}) => {
  return await apiClient.get<Paginated<Lessons_Dto_LessonGetResponse>>(
    `lessons?${qs.stringify(data)}`
  );
};

export const fetchLessonDetails = async ({ lessonId }: { lessonId: string }) => {
  return await apiClient.get<Required<Lessons_Dto_LessonDetailResponse>>(`Lessons/${lessonId}`);
};

export const submitLessonRecording = async ({
  uri,
  duration,
  lessonId,
}: {
  uri: string;
  lessonId: string;
  duration: number;
}) => {
  const form = new FormData();
  form.append("Recording", {
    uri,
    name: "recording.mp3",
    type: "audio/mpeg",
  });
  form.append("LessonId", lessonId);
  form.append("RecordingDuration", `${duration}`);
  return apiClient.postForm("LessonSubmission/recording", form);
};

export const deleteSubmission = async (body: { lessonId: string; studentId: string }) =>
  apiClient.delete("LessonSubmission/recording", body);

export const fetchRecordingUrl = async ({
  lessonId,
  recordingId,
  studentId,
}: {
  lessonId: string;
  recordingId: string;
  studentId: string;
}) => {
  return (
    (await apiClient.get(
      `${BASE_URL}LessonSubmission/recording/file/url?LessonId=${lessonId}&FileName=${recordingId}&StudentId=${studentId}`
    )) as { url: string }
  ).url;
};

export const fetchFeedbackUrl = async ({
  lessonId,
  feedbackId,
  studentId,
}: {
  lessonId: string;
  feedbackId: string;
  studentId: string;
}) => {
  return (
    (await apiClient.get(
      `${BASE_URL}LessonSubmission/feedback/file/url?LessonId=${lessonId}&FileName=${feedbackId}&StudentId=${studentId}`
    )) as {
      url: string;
    }
  ).url;
};

export const deleteLesson = async (lessonId: string) => {
  return apiClient.delete(`Lessons/${lessonId}`);
};
