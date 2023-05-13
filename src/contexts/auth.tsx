import { createContext, useState } from "react";
import * as auth from "../api/authClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "types/User";

interface AuthContextData {
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

  const [user, setUser] = useState<User | undefined>();

  const signIn = async (username: string, password: string) => {
    const res = await auth.signIn({ username, password });
    if (res.accessToken) {
      await AsyncStorage.setItem("accessToken", res.accessToken);
      handleSignIn();
    }
  };

  const handleSignIn = () => {
    setSignedIn(true);
    //TODO: HENT BRUGER OPLYSNINGER FRA API
    setUser({
      name: "Matin Kacer",
      email: "xfarouk@live.dk",
      role: "Student",
    });
  };
  const signOut = async () => {
    await AsyncStorage.removeItem("accessToken");
    setSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ signed: signedIn, signIn, user, handleSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
