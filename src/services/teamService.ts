import { useQuery } from "@tanstack/react-query";
import apiClient from "api/apiClient";
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
  const { data, isLoading } = useQuery(["students-list", teamId], () =>
    fetchStudentsList({ teamId })
  );
  return { studentsList: data?.list, isLoadingStudentsList: isLoading };
};
