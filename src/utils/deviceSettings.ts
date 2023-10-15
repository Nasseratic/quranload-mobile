import { ActivityAction, startActivityAsync } from "expo-intent-launcher";
import { Linking, Platform } from "react-native";
import { match } from "ts-pattern";
import * as Application from "expo-application";

type SettingsScreen = "" | "notifications";

export const openAppDeviceSettings = (settingsScreen: SettingsScreen = "") => {
  if (Platform.OS === "ios") {
    Linking.openURL(`app-settings:${settingsScreen}`);
    return;
  }

  match(settingsScreen)
    .with("notifications", () =>
      startActivityAsync(ActivityAction.APP_NOTIFICATION_SETTINGS, {
        extra: { "android.provider.extra.APP_PACKAGE": Application.applicationId },
      })
    )
    .otherwise(() =>
      startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
        data: `package:${Application.applicationId}`,
      })
    );
};
