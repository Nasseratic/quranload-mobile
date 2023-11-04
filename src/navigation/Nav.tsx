import { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Colors } from "constants/Colors";
import { StudentHomeScreen } from "screens/student/StudentHomeScreen";
import AssignmentsScreen from "screens/student/AssignmentsScreen";
import LoginScreen from "screens/auth/LoginScreen";
import ProfileScreen from "screens/account/ProfileScreen";
import AdvancedSettingsScreen from "screens/account/advancedSettings/AdvancedSettingsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import ChangePasswordScreen from "screens/account/advancedSettings/ChangePasswordScreen";
import ChangeLanguageScreen from "screens/account/advancedSettings/ChangeLanguageScreen";
import SubscriptionScreen from "screens/account/advancedSettings/SubscriptionsScreen";
import CancelSubscriptionScreen from "screens/account/advancedSettings/CancelSubscriptionScreen";
import ResetPasswordScreen from "screens/auth/ResetPasswordScreen";
import RegisterAccount from "screens/auth/RegisterAccount";
import { RecordScreen } from "screens/student/RecordScreen/RecordScreen";
import { TeacherHomeScreen } from "screens/teacher/TeacherHomeScreen";
import { TeacherHomeworkScreen } from "screens/teacher/TeacherHomeworkScreen";
import { TeacherSubmissionsScreen } from "screens/teacher/TeacherSubmissionsScreen";
import { TeacherCreateHomeworkScreen } from "screens/teacher/TeacherCreateHomeworkScreen";
import { TeacherAutoHomeworkScreen } from "screens/teacher/TeacherAutoHomeworkScreen";
import { useAuth } from "contexts/auth";
import { NotificationsBottomSheet } from "components/NotificationsBottomSheet";
import { TeacherStudentsListScreen } from "screens/teacher/TeacherStudentsListScreen";
import { RootStackParamList } from "./navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Nav = () => {
  const { signed, user, handleSignIn } = useAuth();

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
    <>
      {signed && <NotificationsBottomSheet />}
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={signed ? "StudentHome" : "Login"}
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
                  <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
                  <Stack.Screen name="Assignments" component={AssignmentsScreen} />
                  <Stack.Screen name="Subscriptions" component={SubscriptionScreen} />
                  <Stack.Screen name="CancelSubscription" component={CancelSubscriptionScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
                  <Stack.Screen name="TeacherHomework" component={TeacherHomeworkScreen} />
                  <Stack.Screen name="TeacherSubmissions" component={TeacherSubmissionsScreen} />
                  <Stack.Screen
                    name="TeacherCreateHomework"
                    component={TeacherCreateHomeworkScreen}
                  />
                  <Stack.Screen name="TeacherAutoHomework" component={TeacherAutoHomeworkScreen} />
                  <Stack.Screen name="TeacherStudentsList" component={TeacherStudentsListScreen} />
                </>
              )}
              <Stack.Screen name="Record" component={RecordScreen} />
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
    </>
  );
};

export default Nav;
