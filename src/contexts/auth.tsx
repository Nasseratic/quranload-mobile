import { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "types/User";
import { fetchUserProfile } from "services/profileService";
import * as SplashScreen from "expo-splash-screen";
import { signIn } from "services/authService";
import { useQuery } from "@tanstack/react-query";

interface AuthContextData {
  initialized: boolean;
  signed: boolean;
  user: User | undefined;
  accessToken: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleSignIn: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  const role = context.user?.roles[0] ?? "Student";

  return {
    ...context,
    role,
    isTeacher: role === "Teacher",
    isStudent: role === "Student",
  };
};

export const useUser = () => {
  const { user } = useContext(AuthContext);
  if (!user) {
    throw new Error("Cannot use useUser when user is not authenticated");
  }
  return user;
};

export const useMaybeUser = () => {
  const { user } = useContext(AuthContext);
  return user;
};

interface Props {
  children: React.ReactNode;
}
export const profileQueryKey = "userProfile";

export const AuthProvider = ({ children }: Props) => {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { refetch, data: user } = useQuery([profileQueryKey], fetchUserProfile, {
    enabled: false,
  });

  const trySignIn = async (username: string, password: string) => {
    const res = await signIn({ username, password });
    if (res.data.accessToken) {
      await AsyncStorage.setItem("accessToken", res.data.accessToken);
      await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
      handleSignIn();
    }
  };

  const handleSignIn = () => {
    AsyncStorage.getItem("accessToken").then(setAccessToken);
    refetch()
      .then(() => {
        setSignedIn(true);
      })
      .catch(() => {
        setSignedIn(false);
      })
      .finally(() => {
        setInitialized(true);
        // a delay to not show login screen for already logged in users
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 300);
      });
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    setSignedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        initialized,
        signed: signedIn,
        signIn: trySignIn,
        user,
        handleSignIn,
        signOut,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
