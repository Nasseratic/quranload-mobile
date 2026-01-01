import { useQuery } from "@tanstack/react-query";
import apiClient from "api/apiClient";
import Paginated from "types/Paginated";
import { Organizations_Dto_OrganizationGetResponse } from "__generated/apiTypes";

export const useOrganizations = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await apiClient.get<Paginated<Organizations_Dto_OrganizationGetResponse>>(
        "Organizations"
      );

      return response.list;
    },
  });

  return { organizations: data, isOrganizationsLoading: isLoading };
};
