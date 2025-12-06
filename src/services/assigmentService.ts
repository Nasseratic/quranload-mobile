import { client } from "api/convex";
import { api } from "../../convex/_generated/api";
import { Id } from "api/convex";

type Attachment = {
  id: string;
  uri: string;
  sortOrder: number;
};

type CreateAssignmentInput = {
  teamId: string;
  startDate: string;
  endDate: string;
  description: string;
  attachments: Attachment[];
};

export enum AssignmentTypeEnum {
  Auto = 1,
  Custom = 2,
}

export const createCustomAssignment = async (assignment: CreateAssignmentInput) => {
  await client.mutation(api.services.assignments.createAssignment, {
    teamId: assignment.teamId as Id<"teams">,
    typeId: AssignmentTypeEnum.Custom,
    description: assignment.description,
    startDate: assignment.startDate,
    endDate: assignment.endDate,
    attachments: assignment.attachments,
  });
};

export const updateCustomAssignment = async (assignment: CreateAssignmentInput & { id: string }) => {
  await client.mutation(api.services.assignments.updateAssignment, {
    id: assignment.id as Id<"assignments">,
    teamId: assignment.teamId as Id<"teams">,
    typeId: AssignmentTypeEnum.Custom,
    description: assignment.description,
    startDate: assignment.startDate,
    endDate: assignment.endDate,
    attachments: assignment.attachments,
  });
};

export const deleteAssignment = async (assignmentId: string) => {
  await client.mutation(api.services.assignments.deleteAssignment, {
    id: assignmentId as Id<"assignments">,
  });
};
