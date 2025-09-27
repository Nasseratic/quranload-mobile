// import { cvx, FunctionReturnType } from "api/convex";
// import { useQuery } from "convex/react";
import { isDevelopmentBuild } from "expo-dev-client";

// type FF = keyof FunctionReturnType<typeof cvx.featureFlags.ffs>;
type FF = "chat" | "inAppEnrolment" | "supportChat";

const devFfs = {
  chat: false,
  inAppEnrolment: true,
  supportChat: false,
} satisfies Record<FF, boolean>;

export const useFeatureFlags = () => {
  // const ffs = useQuery(cvx.featureFlags.ffs);
  const ffs: Record<FF, boolean> | undefined = undefined;
  return {
    ff: isDevelopmentBuild() ? devFfs : ffs ?? devFfs,
  };
};
