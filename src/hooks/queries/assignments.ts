import { fetchUserLessons } from "services/lessonsService";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusEnum } from "types/Lessons";
import { useUser } from "contexts/auth";
import { Lessons_Dto_LessonGetResponse } from "__generated/apiTypes";

export type Assignment = Omit<Required<Lessons_Dto_LessonGetResponse>, "status"> & {
  status: AssignmentStatusEnum;
};

export const useAssignments = ({ status }: { status: AssignmentStatusEnum | null }) => {
  const user = useUser();

  const { data: assignments, isLoading: isAssignmentsLoading } = useQuery(
    ["assignments", status],
    async () => {
      if (!user) return null;
      const results = await Promise.all(
        user?.teams.map((team) =>
          fetchUserLessons({
            teamId: team.id,
            lessonState: status ?? undefined,
          })
        )
      );

      return Object.fromEntries(
        user?.teams.map(
          (team, index) => [team.id, results[index]?.list as unknown as Assignment[]] as const
        )
      );
    },
    {
      enabled: !!user,
    }
  );

  return { assignments, isAssignmentsLoading };
};
