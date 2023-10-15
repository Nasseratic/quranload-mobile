import { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "types/User";
import { fetchUserProfile } from "services/profileService";
import * as SplashScreen from "expo-splash-screen";
import { signIn } from "services/authService";

interface AuthContextData {
  initialized: boolean;
  signed: boolean;
  user: User | undefined;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleSignIn: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useUser = () => {
  const { user } = useContext(AuthContext);
  return user;
};

interface Props {
  children: React.ReactNode;
}
export const AuthProvider = ({ children }: Props) => {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [user, setUser] = useState<User | undefined>();

  const trySignIn = async (username: string, password: string) => {
    const res = await signIn({ username, password });
    if (res.data.accessToken) {
      await AsyncStorage.setItem("accessToken", res.data.accessToken);
      await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
      handleSignIn();
    }
  };

  const handleSignIn = () => {
    fetchUserProfile()
      .then((res) => {
        console.log(res);
        setUser(res);
        setSignedIn(true);
      })
      .catch((err) => {
        console.log(err);
        setSignedIn(false);
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .finally(async () => {
        setInitialized(true);
        await SplashScreen.hideAsync();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
