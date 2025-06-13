import { cvx, FunctionReturnType } from "api/convex";
import { useQuery } from "convex/react";
import { isDevelopmentBuild } from "expo-dev-client";

type FF = keyof FunctionReturnType<typeof cvx.featureFlags.ffs>;

const devFfs = {
  chat: true,
  inAppEnrolment: true,
  supportChat: true,
} satisfies Record<FF, boolean>;

export const useFeatureFlags = () => {
  const ffs = useQuery(cvx.featureFlags.ffs);
  return {
    ff: isDevelopmentBuild() ? devFfs : ffs,
  };
};
