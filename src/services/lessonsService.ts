import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { Id } from "api/convex";
import Paginated from "types/Paginated";
import { AssignmentStatusEnum } from "types/Lessons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sleep } from "utils/sleep";

// Types to match the existing API response structure
type LessonGetResponse = {
  id: string;
  assignmentId?: string;
  teamId: string;
  studentId: string;
  studentName: string;
  teacherId?: string;
  title?: string;
  description?: string;
  startPage?: number;
  endPage?: number;
  status: string;
  lessonState: number;
  dueDate?: string;
  createdAt: string;
  submission?: any;
  feedback?: any;
};

type LessonDetailResponse = {
  id: string;
  assignmentId?: string;
  teamId: string;
  teamName: string;
  studentId: string;
  studentName: string;
  teacherId?: string;
  teacherName: string;
  title?: string;
  description?: string;
  startPage?: number;
  endPage?: number;
  status: string;
  lessonState: number;
  dueDate?: string;
  createdAt: string;
  submission?: any;
  feedback?: any;
  attachments?: any[];
};

export const fetchUserLessons = async (data: {
  teamId: string;
  lessonState?: AssignmentStatusEnum;
  pageNumber?: number;
  pageSize?: number;
}): Promise<Paginated<LessonGetResponse>> => {
  const result = await client.query(api.services.lessons.getLessons, {
    teamId: data.teamId as Id<"teams">,
    lessonState: data.lessonState,
    pageNumber: data.pageNumber,
    pageSize: data.pageSize,
  });

  return {
    pager: result.pager,
    list: result.list as any,
  };
};

export const fetchLessonDetails = async ({
  lessonId,
}: {
  lessonId: string;
}): Promise<LessonDetailResponse> => {
  const result = await client.query(api.services.lessons.getLessonDetails, {
    lessonId: lessonId as Id<"lessons">,
  });

  return result as any;
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
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const user = await client.query(api.services.auth.getCurrentUser, { refreshToken });
  if (!user) {
    throw new Error("User not found");
  }

  // Get upload URL from Convex
  const uploadUrl = await client.mutation(api.services.submissions.generateUploadUrl, {});

  // Upload the file
  const response = await fetch(uri);
  const blob = await response.blob();

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "audio/mpeg",
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload recording");
  }

  const { storageId } = await uploadResponse.json();

  // Submit the recording to Convex
  await Promise.all([
    client.mutation(api.services.submissions.submitRecording, {
      lessonId: lessonId as Id<"lessons">,
      studentId: user.id as Id<"users">,
      recordingFileId: storageId,
      recordingDuration: duration,
    }),
    sleep(2000),
  ]);

  return { message: "Recording submitted" };
};

export const deleteSubmission = async (body: { lessonId: string; studentId: string }) => {
  await client.mutation(api.services.submissions.deleteSubmission, {
    lessonId: body.lessonId as Id<"lessons">,
    studentId: body.studentId as Id<"users">,
  });
};

export const fetchRecordingUrl = async ({
  lessonId,
  recordingId,
  studentId,
}: {
  lessonId: string;
  recordingId: string;
  studentId: string;
}): Promise<string> => {
  const result = await client.query(api.services.submissions.getRecordingUrl, {
    lessonId: lessonId as Id<"lessons">,
    studentId: studentId as Id<"users">,
  });

  return result?.url ?? "";
};

export const fetchFeedbackUrl = async ({
  lessonId,
  feedbackId,
  studentId,
}: {
  lessonId: string;
  feedbackId: string;
  studentId: string;
}): Promise<string> => {
  const result = await client.query(api.services.submissions.getFeedbackUrl, {
    lessonId: lessonId as Id<"lessons">,
    studentId: studentId as Id<"users">,
  });

  return result?.url ?? "";
};

export const deleteLesson = async (lessonId: string) => {
  await client.mutation(api.services.lessons.deleteLesson, {
    lessonId: lessonId as Id<"lessons">,
  });
};
