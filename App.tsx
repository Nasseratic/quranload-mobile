import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "screens/home-screen";
import AssignmentsScreen from "screens/assignments-screen";

export default function App() {
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
