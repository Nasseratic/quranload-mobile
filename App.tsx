import React from "react";
import {
  useFonts,
  NotoSans_700Bold,
  NotoSans_600SemiBold,
  NotoSans_400Regular,
} from "@expo-google-fonts/noto-sans";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "screens/dashboard-screen";
import AssignmentsScreen from "screens/assignments-screen";
import { Colors } from "constants/Colors";

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
      <RootStack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.White[1],
          },
        }}
      >
        <RootStack.Screen name="Dashboard" component={Dashboard} />
        <RootStack.Screen name="Assignments" component={AssignmentsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
