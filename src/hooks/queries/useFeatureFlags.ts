import { cvx, FunctionReturnType } from "api/convex";
import { useQuery } from "convex/react";
import { isDevelopmentBuild } from "expo-dev-client";

type FF = "chat" | "inAppEnrolment" | "supportChat";

const devFfs = {
  chat: false,
  inAppEnrolment: true,
  supportChat: false,
} satisfies Record<FF, boolean>;

export const useFeatureFlags = () => {
  const ffs = useQuery(cvx.featureFlags.ffs);
  return {
    ff: isDevelopmentBuild() ? devFfs : ffs ?? devFfs,
  };
};
