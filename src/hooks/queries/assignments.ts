import { fetchUserLessons } from "services/lessonsService";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusEnum } from "types/Lessons";
import { useUser } from "contexts/auth";
import { isNotNullish } from "utils/notNullish";
import { Lessons_Dto_LessonGetResponse } from "__generated/apiTypes";

export type Assignment = Omit<Required<Lessons_Dto_LessonGetResponse>, "status"> & {
  status: AssignmentStatusEnum;
};

export const useAssignments = ({ status }: { status: AssignmentStatusEnum | null }) => {
  const user = useUser();

  const { data: assignments, isLoading: isAssignmentsLoading } = useQuery(
    ["assignments", status],
    () =>
      user
        ? (Promise.all(
            user?.teams.map((team) =>
              fetchUserLessons({
                teamId: team.id,
                lessonState: status ?? undefined,
              })
            )
          ).then((results) => {
            const assignments = results.filter(isNotNullish);

            const assignmentsByTeam = Object.fromEntries(
              assignments.map((result) => [result.list[0].teamId!, result.list])
            );
            return assignmentsByTeam;
          }) as Promise<Record<string, Assignment[]>>)
        : null,
    {
      enabled: !!user,
    }
  );

  return { assignments, isAssignmentsLoading };
};
