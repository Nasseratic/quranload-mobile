import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { Id } from "api/convex";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface IFetchTeacherStatsRequest {
  teamId: string;
}
interface IFetchTeacherStatsResponse {
  totalSubmissions: number;
  totalRejections: number;
  totalMissed: number;
  totalApprovedMinutes: number;
  totalApprovedPages: number;
}

export const fetchTeacherStats = async ({
  teamId,
}: IFetchTeacherStatsRequest): Promise<IFetchTeacherStatsResponse> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const user = await client.query(api.services.auth.getCurrentUser, { refreshToken });
  if (!user) {
    throw new Error("User not found");
  }

  const result = await client.query(api.services.profile.getTeacherStats, {
    userId: user.id as Id<"users">,
    teamIds: [teamId as Id<"teams">],
  });

  return result;
};
