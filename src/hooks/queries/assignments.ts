import { fetchUserLessons } from "services/lessonsService";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusEnum } from "types/Lessons";
import { useUser } from "contexts/auth";
import { Lessons_Dto_LessonGetResponse } from "__generated/apiTypes";

export type Assignment = Omit<Required<Lessons_Dto_LessonGetResponse>, "status"> & {
  status: AssignmentStatusEnum;
};

export const useAssignments = ({
  status,
  teamId,
}: {
  status: AssignmentStatusEnum | null;
  teamId: string;
}) => {
  const user = useUser();

  const { data: assignments, isLoading: isAssignmentsLoading } = useQuery({
    queryKey: ["assignments", status, teamId],
    queryFn: async () => {
      if (!user) return null;
      return (
        await fetchUserLessons({
          teamId,
          lessonState: status ?? undefined,
        })
      ).list as unknown as Assignment[];
    },
    enabled: !!user,
  });

  return { assignments, isAssignmentsLoading };
};

export const useLatestAssignmentForTeam = (teamId: string) => {
  const { data } = useQuery({
    queryKey: ["latest-assignment", null, teamId],
    queryFn: async () =>
      fetchUserLessons({
        teamId,
        lessonState: AssignmentStatusEnum.pending,
        pageSize: 1,
        pageNumber: 1,
      }),
    enabled: !!teamId,
  });

  return data?.list[0] as Assignment | undefined;
};
