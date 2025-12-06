import { useQuery } from "@tanstack/react-query";
import { client } from "api/convex";
import { api } from "../../../convex/_generated/api";

export const useOrganizations = () => {
  const { data, isLoading } = useQuery(["organizations"], async () => {
    const response = await client.query(api.services.teams.getOrganizations, {});
    return response.list;
  });

  return { organizations: data, isOrganizationsLoading: isLoading };
};
