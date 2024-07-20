import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Database } from "types/Supabase";
import { supabase } from "utils/supabase";

export const useFeatureFlags = () => {
  const { data } = useQuery(["featureFlags"], async () => {
    const { data, error } = await supabase.from("featureFlags").select("*");
    if (error) throw error;
    return data;
  });

  const ff = useMemo(
    () =>
      Object.fromEntries(data?.map((flag) => [flag.name, flag.isEnabled] as const) ?? []) as Record<
        Database["public"]["Enums"]["featureFlag"],
        boolean
      >,
    [data]
  );

  return { ff };
};
