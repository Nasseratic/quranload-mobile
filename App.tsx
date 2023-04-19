import React from "react";
import {
  useFonts,
  NotoSans_700Bold,
  NotoSans_600SemiBold,
  NotoSans_400Regular,
} from "@expo-google-fonts/noto-sans";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "screens/home-screen";
import AssignmentsScreen from "screens/assignments-screen";

export default function App() {
  const [fontsLoaded] = useFonts({
    "NotoSans-regular": NotoSans_400Regular,
    "NotoSans-semibold": NotoSans_600SemiBold,
    "NotoSans-bold": NotoSans_700Bold,
  });

  if (!fontsLoaded) return null;

  const RootStack = createNativeStackNavigator<Frontend.Navigation.RootStackParamList>();

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Home" component={HomeScreen} />
        <RootStack.Screen name="Assignments" component={AssignmentsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
