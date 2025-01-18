import { ConvexReactClient, ConvexProvider as _ConvexProvider } from "convex/react";
import { api } from "../../convex/_generated/api";
export const client = new ConvexReactClient("https://courteous-goat-120.convex.cloud");

export type { FunctionReturnType } from "convex/server";

export const cvx = api.services;

export const ConvexProvider = ({ children }: { children: React.ReactNode }) => {
  return <_ConvexProvider client={client}>{children}</_ConvexProvider>;
};
