import apiClient from "api/apiClient";

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

export const createCustomAssignment = async (assignment: CreateAssignmentInput) =>
  apiClient.post("Assignments", { ...assignment, typeId: AssignmentTypeEnum.Custom });
