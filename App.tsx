import {
  useFonts,
  NotoSans_700Bold,
  NotoSans_600SemiBold,
  NotoSans_400Regular,
  NotoSans_500Medium,
} from "@expo-google-fonts/noto-sans";
import Nav from "navigation/Nav";
import { AuthProvider } from "contexts/auth";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "./tamagui.config";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Audio } from "expo-av";
import { RootActionSheetContainer } from "components/ActionSheet";
import { RootToastContainer } from "components/Toast";
import "react-native-url-polyfill/auto";
import { useEffect } from "react";
import { AvoidSoftInput } from "react-native-avoid-softinput";
import { ConvexProvider } from "api/convex";
import { queryClient } from "utils/reactQueryClient";
import "api/apiClientInterceptors";

require("./src/locales/config");

Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
});

SplashScreen.preventAutoHideAsync();

function App() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    "NotoSans-regular": NotoSans_400Regular,
    "NotoSans-semibold": NotoSans_600SemiBold,
    "NotoSans-bold": NotoSans_700Bold,
    "NotoSans-medium": NotoSans_500Medium,
  });
  useEffect(() => {
    AvoidSoftInput.setEnabled(true);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
          <BottomSheetModalProvider>
            <ConvexProvider>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  <RootToastContainer />
                  <Nav />
                </AuthProvider>
              </QueryClientProvider>
              <RootActionSheetContainer />
            </ConvexProvider>
          </BottomSheetModalProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
