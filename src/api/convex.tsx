import {
  ConvexReactClient,
  useMutation,
  useQuery,
} from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const client = new ConvexReactClient(
  "https://perceptive-mosquito-758.convex.cloud"
);

export type { FunctionReturnType } from "convex/server";

export type { Id, Doc } from "../../convex/_generated/dataModel";

export const cvx = api.services;

// Custom storage for React Native using AsyncStorage
// Using namespaced keys to avoid conflicts with old auth tokens
const STORAGE_PREFIX = "convex_auth_v2_";
const tokenStorage = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(STORAGE_PREFIX + key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(STORAGE_PREFIX + key);
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
