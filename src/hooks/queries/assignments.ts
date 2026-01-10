import { fetchUserLessons } from "services/lessonsService";
import { useQuery } from "@tanstack/react-query";
import { AssignmentStatusEnum } from "types/Lessons";
import { useUser } from "contexts/auth";
import { Lessons_Dto_LessonGetResponse } from "__generated/apiTypes";
import { useCvxQuery } from "api/convex";
import { api } from "../../../convex/_generated/api";
import { useMemo } from "react";

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

export const useLatestAssignmentWithProcessingForTeam = (teamId: string) => {
  const user = useUser();

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

  const processingSessions = useCvxQuery(
    api.services.recordings.getProcessingSessionsForUser,
    user ? { userId: user.id } : "skip"
  );

  const assignment = useMemo(() => {
    const assignment = data?.list[0] as Assignment | undefined;
    if (!assignment) return undefined;

    return {
      ...assignment,
      processingStatus: processingSessions?.[assignment.id] as
        | "finalizing"
        | "processing"
        | undefined,
    };
  }, [data, processingSessions]);

  return assignment;
};
