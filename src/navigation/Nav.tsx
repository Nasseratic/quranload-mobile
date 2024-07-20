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
import RegisterAccount from "screens/auth/RegisterAccount";
import { RecordScreen } from "screens/student/RecordScreen/RecordScreen";
import { TeacherHomeScreen } from "screens/teacher/TeacherHomeScreen";
import { TeacherHomeworkScreen } from "screens/teacher/TeacherHomeworkScreen";
import { TeacherSubmissionsScreen } from "screens/teacher/TeacherSubmissionsScreen";
import { TeacherCreateHomeworkScreen } from "screens/teacher/TeacherCreateHomeworkScreen";
import { TeacherAutoHomeworkScreen } from "screens/teacher/TeacherAutoHomeworkScreen";
import { useAuth, useUser } from "contexts/auth";
import { NotificationsBottomSheet } from "components/NotificationsBottomSheet";
import { TeacherStudentsListScreen } from "screens/teacher/TeacherStudentsListScreen";
import { RootStackParamList } from "./navigation";
import { MushafScreen } from "screens/mushuf/MushafScreen";
import { ChatScreen } from "screens/chat/ChatScreen";
import { ChatListScreen } from "screens/chat/ChatListScreen";
import { TeamListScreen } from "screens/chat/TeamListScreen";
import { useDeepLinkHandler, useNotificationActionHandler } from "hooks/useDeeplinks";
import { navigationRef } from "navigation/navRef";
import { ForgotPasswordScreen } from "screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "screens/auth/ResetPasswordScreen";
import { ConfirmEmailScreen } from "screens/auth/ConfirmEmailScreen";
import { ChatNewScreen } from "screens/chat/ChatNewScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const AuthenticatedStack = () => {
  const user = useUser();

  return (
    <>
      <NotificationsBottomSheet />
      <Stack.Navigator
        initialRouteName="StudentHome"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.White[1],
          },
        }}
      >
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
            <Stack.Screen name="TeacherCreateHomework" component={TeacherCreateHomeworkScreen} />
            <Stack.Screen name="TeacherAutoHomework" component={TeacherAutoHomeworkScreen} />
            <Stack.Screen name="TeacherStudentsList" component={TeacherStudentsListScreen} />
          </>
        )}
        <Stack.Screen name="Record" component={RecordScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AdvancedSettings" component={AdvancedSettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="ChangeLanguage" component={ChangeLanguageScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
        <Stack.Screen name="ChatNewScreen" component={ChatNewScreen} />
        <Stack.Screen name="TeamListScreen" component={TeamListScreen} />
        <Stack.Screen name="Mushaf" component={MushafScreen} />
      </Stack.Navigator>
    </>
  );
};

const Nav = () => {
  const { signed, user, handleSignIn } = useAuth();

  useEffect(() => {
    async function initialize() {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        handleSignIn();
      } else {
        SplashScreen.hideAsync();
      }
    }

    initialize().catch(console.error);
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <DeepLinks />
      {signed && user ? (
        <AuthenticatedStack />
      ) : (
        <Stack.Navigator
          initialRouteName={"Login"}
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors.White[1],
            },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="ConfirmEmailScreen" component={ConfirmEmailScreen} />
          <Stack.Screen name="RegisterAccount" component={RegisterAccount} />
          <Stack.Screen name="Mushaf" component={MushafScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default Nav;

const DeepLinks = () => {
  useDeepLinkHandler();
  useNotificationActionHandler();
  return null;
};
