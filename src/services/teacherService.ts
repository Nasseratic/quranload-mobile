import apiClient from "api/apiClient";

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
}: IFetchTeacherStatsRequest): Promise<IFetchTeacherStatsResponse> =>
  await apiClient.get(`Lessons/TeacherStats?TeamId=${teamId}`);
