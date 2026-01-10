import { useMemo } from "react";
import { useAssignments, Assignment } from "hooks/queries/assignments";
import { useUser } from "contexts/auth";
import { useCvxQuery } from "api/convex";
import { api } from "../../../convex/_generated/api";
import { AssignmentStatusEnum } from "types/Lessons";

export type AssignmentWithProcessing = Assignment & {
  processingStatus?: "finalizing" | "processing";
};

export const useAssignmentsWithProcessingStatus = ({
  status,
  teamId,
}: {
  status: AssignmentStatusEnum | null;
  teamId: string;
}) => {
  const user = useUser();

  const { assignments, isAssignmentsLoading } = useAssignments({
    status,
    teamId,
  });

  const processingSessions = useCvxQuery(
    api.services.recordings.getProcessingSessionsForUser,
    user ? { userId: user.id } : "skip"
  );

  const assignmentsWithProcessing = useMemo(() => {
    if (!assignments) return undefined;

    return assignments.map((assignment) => ({
      ...assignment,
      processingStatus: processingSessions?.[assignment.id] as
        | "finalizing"
        | "processing"
        | undefined,
    }));
  }, [assignments, processingSessions]);

  return { assignments: assignmentsWithProcessing, isAssignmentsLoading };
};
