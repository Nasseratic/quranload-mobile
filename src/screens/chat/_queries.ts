import { useQuery } from "@tanstack/react-query";
import { supabase } from "utils/supabase";
const fetchLatestTeamMessage = async (teamId: string) => {
  // Fetch the latest team message
  return supabase
    .from("messages")
    .select()
    .order("createdAt", { ascending: false })
    .eq("teamId", teamId)
    .is("receiverId", null)
    .limit(1)
    .single()
    .then(({ data }) => data?.text ?? "");
};

const fetchMessagesFromTeamMembers = async (teamId: string) => {
  // Fetch the latest private messages from current team
  return supabase
    .from("latestMessageInConversation")
    .select()
    .eq("teamId", teamId)
    .then(({ data }) => data || []);
};

export const useConversations = (teamId: string) => {
  const { data, isLoading } = useQuery(["latest-private-messages", teamId], () =>
    fetchMessagesFromTeamMembers(teamId)
  );

  return { conversations: data, isLoadingConversations: isLoading };
};

export const useLatestTeamMessage = (teamId: string) => {
  const { data, isLoading } = useQuery(["latest-team-message", teamId], () =>
    fetchLatestTeamMessage(teamId)
  );

  return { latestTeamMessage: data, isLoadingLatestTeamMessage: isLoading };
};
