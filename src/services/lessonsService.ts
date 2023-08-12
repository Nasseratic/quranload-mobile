import apiClient from "api/apiClient";
import qs from "qs";
import Paginated from "types/Paginated";
import { AssignmentStatusEnum } from "types/Lessons";
export const GetUserLesson = async (data: {
  teamId: string;
  lessonState?: AssignmentStatusEnum;
  pageNumber?: number;
  pageSize?: number;
}): Promise<Paginated<Frontend.Content.Assignment>> => {
  return await apiClient.get<Paginated<Frontend.Content.Assignment>>(
    `lessons?${qs.stringify(data)}`
  );
};
