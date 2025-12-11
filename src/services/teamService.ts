import { useQuery } from "@tanstack/react-query";
import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { Id } from "api/convex";
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

export const fetchStudentsList = async ({
  teamId,
}: IFetchStudentsListRequest): Promise<IFetchStudentsListResponse> => {
  const result = await client.query(api.services.teams.getStudentsList, {
    teamId: teamId as Id<"teams">,
  });

  return {
    pager: result.pager,
    list: result.list as any,
  };
};

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
