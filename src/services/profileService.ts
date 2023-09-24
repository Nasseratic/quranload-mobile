import apiClient from "api/apiClient";
import { User } from "types/User";
import Paginated from "types/Paginated";
export const fetchUserProfile = async (): Promise<User> => {
  return await apiClient.get<User>("profiles/profile");
};

export const fetchSubscriptions = async (): Promise<Paginated<Frontend.Content.Subscription>> => {
  return await apiClient.get<Paginated<Frontend.Content.Subscription>>("profiles/PaymentList");
};

export const updateUserProfile = async (data: {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
}): Promise<void> => {
  return await apiClient.put("profiles", data);
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<void> => {
  return await apiClient.post("Manage/ChangePassword", data);
};

export const cancelSubscription = async (teamId: string): Promise<void> => {
  return await apiClient.put(`teams/Unsubscribe?TeamId=${teamId}`, {});
};

type StudentStats = {
  firstSubmission: string;
  lastSubmission: string;
  assignmentVelocities: [
    {
      lessonId: string;
      submissionDate: string;
      averagePageDuration: number;
      totalNumberOfPagesRead: number;
      totalRecordingHours: number;
    }
  ];
  todaySpendMinutes: number;
  totalRecordingHours: number;
  totalNumberOfPagesRead: number;
  averageTimePerPage: number;
};

export const fetchStudentStatistics = async ({
  teamId,
}: {
  teamId: string;
}): Promise<StudentStats> => await apiClient.get(`Lessons/StudentStats?teamId=${teamId}`);
