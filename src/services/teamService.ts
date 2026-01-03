import { useQuery } from "@tanstack/react-query";
import apiClient from "api/apiClient";
import { useUser } from "contexts/auth";
import { User } from "types/User";

interface IFetchStudentsListRequest {
  teamId: string;
}
interface IFetchStudentsListResponse {
  pager: {
    currentPageIndex: number;
    pageSize: number;
    totalRecordCount: number;
    pageCount: number;
  };
  list: User[];
}
export const fetchStudentsList = ({ teamId }: IFetchStudentsListRequest) =>
  apiClient.get<IFetchStudentsListResponse>(`Profiles/UserList?TeamId=${teamId}`);

export const useStudentsList = (teamId: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["students-list", teamId],
    queryFn: () => fetchStudentsList({ teamId }),
  });
  return { studentsList: data?.list, isLoadingStudentsList: isLoading };
};

export const useStudentsListInAllTeams = () => {
  const { teams } = useUser();
  const { data, isLoading } = useQuery({
    queryKey: ["students-list-all-teams"],
    queryFn: () => Promise.all(teams.map((team) => fetchStudentsList({ teamId: team.id }))),
  });
  return { studentsList: data?.map((d) => d.list).flat(), isLoadingStudentsList: isLoading };
};
