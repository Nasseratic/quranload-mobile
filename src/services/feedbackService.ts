import apiClient from "api/apiClient";
import { AssignmentStatusEnum } from "types/Lessons";

export const deleteFeedback = async (body: { lessonId: string; studentId: string }) =>
  apiClient.delete("LessonSubmission/feedback", body);

export const submitFeedback = async (formData: {
  uri: string;
  lessonId: string;
  studentId: string;
  lessonState: AssignmentStatusEnum;
}) => {
  const form = new FormData();
  form.append("LessonId", formData.lessonId);
  form.append("StudentId", formData.studentId);
  form.append("Recording", {
    uri: formData.uri,
    name: "feedback.mp3",
    type: "audio/mpeg",
  });
  form.append("LessonState", `${formData.lessonState}`);
  return apiClient.post("LessonSubmission/feedback", form);
};
