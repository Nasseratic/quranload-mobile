import { cvx } from "api/convex";
import { useQuery } from "convex/react";

type FF = "chat" | "inAppEnrolment" | "supportChat";

const devFfs = {
  chat: false,
  inAppEnrolment: true,
  supportChat: false,
} satisfies Record<FF, boolean>;

export const useFeatureFlags = () => {
  const ffs = useQuery(cvx.featureFlags.ffs);
  return {
    ff: __DEV__ ? devFfs : ffs ?? devFfs,
  };
};
