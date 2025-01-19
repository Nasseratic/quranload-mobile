import { ConvexReactClient, ConvexProvider as _ConvexProvider } from "convex/react";
import { api } from "../../convex/_generated/api";
export const client = new ConvexReactClient("https://courteous-goat-120.convex.cloud");

export type { FunctionReturnType } from "convex/server";

export type { Id, Doc } from "../../convex/_generated/dataModel";

export const cvx = api.services;

export const ConvexProvider = ({ children }: { children: React.ReactNode }) => {
  return <_ConvexProvider client={client}>{children}</_ConvexProvider>;
};
