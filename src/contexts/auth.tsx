import { createContext, useContext, useEffect, useState } from "react";
import { User } from "types/User";
import * as SplashScreen from "expo-splash-screen";
import { Sentry } from "utils/sentry";
import { toast } from "components/Toast";
import { t } from "locales/config";
import { cvx, useCvxMutation, useCvxQuery } from "api/convex";
import { OTA_VERSION } from "components/Version";
import * as Application from "expo-application";
import { Platform } from "react-native";
import { posthog } from "utils/tracking";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

interface AuthContextData {
  initialized: boolean;
  signed: boolean;
  isLoadingUserData: boolean;
  user: User | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetchUser: () => void;
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
  const [initialized, setInitialized] = useState<boolean>(false);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();
  const updateUserInfo = useCvxMutation(cvx.user.updateUserInfo);

  // Fetch user profile from Convex when authenticated
  const user = useCvxQuery(
    cvx.auth.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  // Transform Convex user data to match the User type
  const transformedUser: User | undefined = user
    ? {
        id: user.id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        teams: user.teams as User["teams"],
        roles: user.roles as ("Student" | "Teacher")[],
        username: user.username,
        percentageOfAcceptedOrSubmittedLessons: user.percentageOfAcceptedOrSubmittedLessons,
      }
    : undefined;

  // Handle initialization and splash screen
  useEffect(() => {
    if (!isAuthLoading) {
      setInitialized(true);
      // a delay to not show login screen for already logged in users
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 400);
    }
  }, [isAuthLoading]);

  // Set up Sentry and PostHog when user is authenticated
  useEffect(() => {
    if (isAuthenticated && transformedUser) {
      Sentry.setUser({
        id: transformedUser.id,
        email: transformedUser.emailAddress,
        username: transformedUser.username,
      });
      Sentry.setTag("role", transformedUser.roles[0]);
      Sentry.setTag("userId", transformedUser.id);
      Sentry.setTag("fullName", transformedUser.fullName);

      posthog.identify(transformedUser.id, {
        email: transformedUser.emailAddress,
        username: transformedUser.username,
        role: transformedUser.roles[0],
        gender: transformedUser.gender,
        phoneNumber: transformedUser.phoneNumber,
        activeTeams: transformedUser.teams
          .filter((team) => team.isActive)
          .map((team) => `${team.organizationName} (${team.name})`),
      });

      // Update user info in Convex
      updateUserInfo({
        userId: transformedUser.id!,
        currentOtaVersion: OTA_VERSION,
        currentAppVersion: Application.nativeApplicationVersion ?? "Unknown",
        platform: Platform.OS,
        lastSeen: Date.now(),
      }).catch((error) => {
        // Non-critical error, don't block sign in
        console.error("Failed to update user info", error);
      });
    }
  }, [isAuthenticated, transformedUser?.id]);

  const trySignIn = async (email: string, password: string) => {
    try {
      await convexSignIn("password", { email, password, flow: "signIn" });
    } catch (err: unknown) {
      Sentry.captureException(err, { tags: { module: "AuthProvider.signIn" } });
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await convexSignOut();
      posthog.reset();
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const refetchUser = () => {
    // With Convex queries, data is automatically reactive
    // This is a no-op but kept for API compatibility
  };

  return (
    <AuthContext.Provider
      value={{
        initialized,
        signed: isAuthenticated,
        signIn: trySignIn,
        user: transformedUser,
        isLoadingUserData: isAuthLoading || (isAuthenticated && !user),
        refetchUser,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
