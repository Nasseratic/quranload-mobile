import {
  ConvexReactClient,
  useMutation,
  useQuery,
} from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { isDevelopmentBuild } from "expo-dev-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const client = new ConvexReactClient(
  isDevelopmentBuild()
    ? "https://courteous-goat-120.convex.cloud"
    : "https://gregarious-aardvark-817.convex.cloud"
);

export type { FunctionReturnType } from "convex/server";

export type { Id, Doc } from "../../convex/_generated/dataModel";

export const cvx = api.services;

// Custom storage for React Native using AsyncStorage
const tokenStorage = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

export const ConvexProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConvexAuthProvider client={client} storage={tokenStorage}>
      {children}
    </ConvexAuthProvider>
  );
};

export const useCvxQuery = useQuery;
export const useCvxMutation = useMutation;
