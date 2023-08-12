import { createContext, useState } from "react";
import * as auth from "../api/authClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "types/User";
import { GetUserProfile } from "services/profileService";
import * as SplashScreen from "expo-splash-screen";

interface AuthContextData {
  initialized: boolean;
  signed: boolean;
  user: User | undefined;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleSignIn: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface Props {
  children: React.ReactNode;
}
export const AuthProvider = ({ children }: Props) => {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  const [user, setUser] = useState<User | undefined>();

  const signIn = async (username: string, password: string) => {
    const res = await auth.signIn({ username, password });
    if (res.data.accessToken) {
      await AsyncStorage.setItem("accessToken", res.data.accessToken);
      handleSignIn();
    }
  };

  const handleSignIn = () => {
    GetUserProfile()
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
    setSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ initialized, signed: signedIn, signIn, user, handleSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
