import { useContext, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Colors } from "constants/Colors";
import DashboardScreen from "screens/student/DashboardScreen";
import AssignmentsScreen from "screens/student/AssignmentsScreen";
import LoginScreen from "screens/auth/LoginScreen";
import AuthContext from "contexts/auth";
import ProfileScreen from "screens/account/ProfileScreen";
import AdvancedSettingsScreen from "screens/account/advancedSettings/AdvancedSettingsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "screens/teacher/HomeScreen";
import * as SplashScreen from "expo-splash-screen";
import ChangePasswordScreen from "screens/account/advancedSettings/ChangePasswordScreen";
import ChangeLanguageScreen from "screens/account/advancedSettings/ChangeLanguageScreen";
import SubscriptionScreen from "screens/account/advancedSettings/SubscriptionsScreen";
import CancelSubscriptionScreen from "screens/account/advancedSettings/CancelSubscriptionScreen";
import ResetPasswordScreen from "screens/auth/ResetPasswordScreen";
import RegisterAccount from "screens/auth/RegisterAccount";
import { RecordScreen } from "screens/student/RecordScreen/RecordScreen";

const Stack = createNativeStackNavigator<Frontend.Navigation.RootStackParamList>();

const Nav = () => {
  const { signed, user, handleSignIn } = useContext(AuthContext);

  useEffect(() => {
    async function initialize() {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        handleSignIn();
      } else {
        await SplashScreen.hideAsync();
      }
    }

    initialize().catch(console.error);
  }, []);

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
            {user.roles.indexOf("Student") >= 0 ? (
              <>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Assignments" component={AssignmentsScreen} />
                <Stack.Screen name="Subscriptions" component={SubscriptionScreen} />
                <Stack.Screen name="CancelSubscription" component={CancelSubscriptionScreen} />
                <Stack.Screen name="Record" component={RecordScreen} />
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
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="RegisterAccount" component={RegisterAccount} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Nav;
