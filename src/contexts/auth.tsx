import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "types/User";
import { fetchUserProfile } from "services/profileService";
import * as SplashScreen from "expo-splash-screen";
import { signIn } from "services/authService";
import { useQuery } from "@tanstack/react-query";
import { Sentry } from "utils/sentry";
import { toast } from "components/Toast";
import { t } from "locales/config";

interface AuthContextData {
  initialized: boolean;
  signed: boolean;
  isLoadingUserData: boolean;
  user: User | undefined;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
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
  const {
    refetch,
    data: user,
    isFetching,
  } = useQuery([profileQueryKey], fetchUserProfile, {
    enabled: false,
  });

  useEffect(() => {
    if (signedIn && user) {
      Sentry.setUser({
        id: user.id,
        email: user.emailAddress,
        username: user.username,
      });
      Sentry.setTag("role", user.roles[0]);
      Sentry.setTag("userId", user.id);
      Sentry.setTag("fullName", user.fullName);
    }
  }, [user]);

  const trySignIn = async (email: string, password: string) => {
    const res = await signIn({ email, password });
    if (res.accessToken) {
      await AsyncStorage.setItem("accessToken", res.accessToken);
      await AsyncStorage.setItem("refreshToken", res.refreshToken);
      handleSignIn();
    }
  };

  const handleSignIn = () => {
    AsyncStorage.getItem("accessToken").then(setAccessToken);
    refetch({ throwOnError: true })
      .then(() => {
        setSignedIn(true);
      })
      .catch((err) => {
        setSignedIn(false);
        Sentry.captureException(err, { tags: { module: "AuthProvider.handleSignIn" } });
        toast.show({
          status: "Error",
          title: t("loginScreen.failedToLoadUserDetails"),
          subTitle: t("reportedToIT"),
          duration: 10 * 1000,
        });
      })
      .finally(() => {
        setInitialized(true);
        // a delay to not show login screen for already logged in users
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 400);
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
        isLoadingUserData: isFetching,
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
