import { fetchUserLessons } from "services/lessonsService";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusEnum } from "types/Lessons";
import { useUser } from "contexts/auth";
import Paginated from "types/Paginated";

export const useAssignments = ({ status }: { status: AssignmentStatusEnum | null }) => {
  const user = useUser();

  const { data: assignments, isLoading: isAssignmentsLoading } = useQuery(
    ["assignments", status],
    () =>
      user
        ? Promise.allSettled(
            user?.teams.map((team) =>
              fetchUserLessons({
                teamId: team.id,
                lessonState: status ?? undefined,
              })
            )
          ).then((results) => {
            const assignments = results.filter(
              (result) => result.status === "fulfilled"
            ) as PromiseFulfilledResult<Paginated<Frontend.Content.Assignment>>[];
            const assignmentsByTeam = Object.fromEntries(
              assignments.map((result) => [result.value.list[0].teamId, result.value.list])
            );
            return assignmentsByTeam;
          })
        : null,
    {
      enabled: !!user,
    }
  );

  return { assignments, isAssignmentsLoading };
};
