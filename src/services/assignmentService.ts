import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { Id } from "api/convex";
import Paginated from "types/Paginated";

interface IFetchAssignmentsRequest {
  teamId: string;
  typeId: number;
}

type AssignmentGetResponse = {
  id: string;
  teamId: string;
  typeId: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  pagesPerDay?: number;
  startFromPage?: number;
  days?: number;
  attachments?: { id: string; uri: string; sortOrder: number }[];
  createdAt: string;
};

export const fetchAutoAssignment = async ({
  teamId,
  typeId,
}: IFetchAssignmentsRequest): Promise<Paginated<AssignmentGetResponse>> => {
  const result = await client.query(api.services.assignments.getAssignments, {
    teamId: teamId as Id<"teams">,
    typeId,
  });

  return {
    pager: result.pager,
    list: result.list as any,
  };
};
