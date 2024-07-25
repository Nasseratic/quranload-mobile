import { useQuery } from "@tanstack/react-query";
import { isDevelopmentBuild } from "expo-dev-client";
import { useMemo } from "react";
import { Database } from "types/Supabase";
import { supabase } from "utils/supabase";

type FF = Database["public"]["Enums"]["featureFlag"];

const devFF = {
  chat: true,
  inAppEnrolment: true,
} satisfies Record<FF, boolean>;

export const useFeatureFlags = () => {
  const { data } = useQuery(["featureFlags"], async () => {
    const { data, error } = await supabase.from("featureFlags").select("*");
    if (error) throw error;
    return data;
  });

  const ff = useMemo(
    () =>
      isDevelopmentBuild()
        ? devFF
        : (Object.fromEntries(
            data?.map((flag) => [flag.name, flag.isEnabled] as const) ?? []
          ) as typeof devFF),
    [data]
  );

  return { ff };
};
