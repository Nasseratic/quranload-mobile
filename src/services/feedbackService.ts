import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { Id } from "api/convex";
import { AssignmentStatusEnum } from "types/Lessons";
import { sleep } from "utils/sleep";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lessonStateMap: Record<AssignmentStatusEnum, "pending" | "submitted" | "accepted" | "rejected"> = {
  [AssignmentStatusEnum.pending]: "pending",
  [AssignmentStatusEnum.submitted]: "submitted",
  [AssignmentStatusEnum.accepted]: "accepted",
  [AssignmentStatusEnum.rejected]: "rejected",
};

export const deleteFeedback = async (body: { lessonId: string; studentId: string }) => {
  await client.mutation(api.services.submissions.deleteFeedback, {
    lessonId: body.lessonId as Id<"lessons">,
    studentId: body.studentId as Id<"users">,
  });
};

export const submitFeedback = async (formData: {
  uri: string;
  lessonId: string;
  studentId: string;
  lessonState: AssignmentStatusEnum;
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
  const response = await fetch(formData.uri);
  const blob = await response.blob();

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "audio/mpeg",
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload feedback");
  }

  const { storageId } = await uploadResponse.json();

  // Submit the feedback to Convex
  await Promise.all([
    client.mutation(api.services.submissions.submitFeedback, {
      lessonId: formData.lessonId as Id<"lessons">,
      teacherId: user.id as Id<"users">,
      studentId: formData.studentId as Id<"users">,
      feedbackFileId: storageId,
      lessonState: lessonStateMap[formData.lessonState],
    }),
    sleep(2000),
  ]);

  return { message: "Feedback submitted" };
};
