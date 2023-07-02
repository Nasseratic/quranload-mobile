import React, { useContext, useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Colors } from "constants/Colors";
import DashboardScreen from "screens/student/DashboardScreen";
import AssignmentsScreen from "screens/student/AssignmentsScreen";
import LoginScreen from "screens/auth/LoginScreen";
import AuthContext from "contexts/auth";
import QuranLoadView from "components/QuranLoadView";
import { Text } from "react-native";
import ProfileScreen from "screens/account/ProfileScreen";
import AdvancedSettingsScreen from "screens/account/advancedSettings/AdvancedSettingsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "screens/teacher/HomeScreen";
import ChangePasswordScreen from "screens/account/advancedSettings/ChangePasswordScreen";
import ChangeLanguageScreen from "screens/account/advancedSettings/ChangeLanguage";
import CancelSubscriptionScreen from "screens/account/advancedSettings/CancelSubscription";

const Stack = createNativeStackNavigator<Frontend.Navigation.RootStackParamList>();

const Nav = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { signed, user, handleSignIn } = useContext(AuthContext);

  useEffect(() => {
    const initialize = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (accessToken) {
        handleSignIn();
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    initialize().catch(console.error);
  });

  if (isLoading)
    return (
      <QuranLoadView>
        <Text>LOADING</Text>
      </QuranLoadView>
    );

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={signed ? "Dashboard" : "Login"}
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.White[1],
          },
        }}
      >
        {signed && user ? (
          <>
            {user.role == "Student" ? (
              <>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Assignments" component={AssignmentsScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="TeacherHome" component={HomeScreen} />
              </>
            )}
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="AdvancedSettings" component={AdvancedSettingsScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="ChangeLanguage" component={ChangeLanguageScreen} />
            <Stack.Screen name="CancelSubscription" component={CancelSubscriptionScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Nav;
