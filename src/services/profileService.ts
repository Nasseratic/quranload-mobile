import apiClient from "api/apiClient";
import { User } from "types/User";
import Paginated from "types/Paginated";
export const GetUserProfile = async (): Promise<User> => {
  return await apiClient.get<User>("profiles/profile");
};

export const GetSubscriptions = async (): Promise<Paginated<Frontend.Content.Subscription>> => {
  return await apiClient.get<Paginated<Frontend.Content.Subscription>>("profiles/PaymentList");
};

export const SaveUserProfile = async (data: {
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

export const forgotPassword = async (data: { userName: string }): Promise<void> => {
  return await apiClient.post("Account/forgotPassword", data);
};

export const cancelSubscription = async (teamId: string): Promise<void> => {
  return await apiClient.put(`teams/Unsubscribe?TeamId=${teamId}`, {});
};
