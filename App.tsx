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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

require("./src/locales/config");

// Create a client
const queryClient = new QueryClient();

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    "NotoSans-regular": NotoSans_400Regular,
    "NotoSans-semibold": NotoSans_600SemiBold,
    "NotoSans-bold": NotoSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Nav />
      </AuthProvider>
    </QueryClientProvider>
  );
}
