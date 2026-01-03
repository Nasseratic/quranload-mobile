import {
  ConvexReactClient,
  ConvexProvider as _ConvexProvider,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../../convex/_generated/api";

// Use environment variable if available, otherwise fallback to hardcoded URLs
const getConvexUrl = () => {
  if (process.env.EXPO_PUBLIC_CONVEX_URL) {
    return process.env.EXPO_PUBLIC_CONVEX_URL;
  }
  return __DEV__
    ? "https://courteous-goat-120.convex.cloud"
    : "https://gregarious-aardvark-817.convex.cloud";
};

export const client = new ConvexReactClient(getConvexUrl());

export type { FunctionReturnType } from "convex/server";

export type { Id, Doc } from "../../convex/_generated/dataModel";

export const cvx = api.services;

export const ConvexProvider = ({ children }: { children: React.ReactNode }) => {
  return <_ConvexProvider client={client}>{children}</_ConvexProvider>;
};

export const useCvxQuery = useQuery;
export const useCvxMutation = useMutation;
