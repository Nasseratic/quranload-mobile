import apiClient from "api/apiClient";
import {Assignments_Dto_AssignmentGetResponse} from '../__generated/apiTypes/models/Assignments_Dto_AssignmentGetResponse';
import Paginated from "types/Paginated";

interface IFetchAssignmentsRequest {
  teamId: string;
  typeId: number;
}
export const fetchAutoAssignment = ({ teamId, typeId }: IFetchAssignmentsRequest) =>
  apiClient.get<Paginated<Assignments_Dto_AssignmentGetResponse>>(`Assignments?TeamId=${teamId}&TypeId=${typeId}`);
