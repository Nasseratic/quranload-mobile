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
export const fetchTeacherStats = ({ teamId }: IFetchTeacherStatsRequest) =>
  apiClient.get<IFetchTeacherStatsResponse>(`Lessons/TeacherStats?TeamIds=${teamId}`);
