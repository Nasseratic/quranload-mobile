import apiClient from "api/apiClient";
import { User } from "types/User";
export const GetUserProfile = async (): Promise<User> => {
  return await apiClient.get<User>("profiles/profile");
};
