import React from "react";
import {
  useFonts,
  NotoSans_700Bold,
  NotoSans_600SemiBold,
  NotoSans_400Regular,
} from "@expo-google-fonts/noto-sans";
import Nav from "navigation/Nav";
import { AuthProvider } from "contexts/auth";
import * as SplashScreen from "expo-splash-screen";

require("./src/locales/config");

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    "NotoSans-regular": NotoSans_400Regular,
    "NotoSans-semibold": NotoSans_600SemiBold,
    "NotoSans-bold": NotoSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Nav />
    </AuthProvider>
  );
}
