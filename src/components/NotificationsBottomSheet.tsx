import { useCallback, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useAuth, useUser } from "contexts/auth";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { t } from "locales/config";
import Typography from "./Typography";
import { Stack } from "tamagui";
import ActionButton from "./buttons/ActionBtn";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Lottie from "lottie-react-native";
import { PermissionStatus } from "expo-modules-core";
import { openAppDeviceSettings } from "utils/deviceSettings";
import * as Device from "expo-device";
import notificationBell from "../assets/lottie/notification-bell.json";
import { match } from "ts-pattern";
import { useAppStatusEffect } from "hooks/useAppStatusEffect";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { differenceInDays } from "date-fns";
import Constants from "expo-constants";
import { isDevelopmentBuild } from "expo-dev-client";
import { supabase } from "utils/supabase";
import { useMutation } from "convex/react";
import { cvx } from "api/convex";
const deviceName = Device.deviceName + ", " + Device.modelName;

export const NotificationsBottomSheet = () => {
  const { signed } = useAuth();
  const [status, requestPermission] = Notifications.usePermissions();
  const insets = useSafeAreaInsets();
  const { teams, id } = useUser();
  const registerToken = useMutation(cvx.pushNotifications.recordPushNotificationToken);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (signed && status) {
      if (status.granted) {
        storeToken();
      } else {
        getLastShownNotificationBottomSheet().then((lastShownAt) => {
          if (!lastShownAt || differenceInDays(new Date(), lastShownAt) >= 7) {
            bottomSheetRef.current?.present();
          }
        });
      }
    }
  }, [signed, status]);

  const storeToken = useCallback(async () => {
    // if (isDevelopmentBuild()) {
    //   return console.log("skipping push notification registration in development build");
    // }
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.easConfig?.projectId,
      })
    ).data;
    registerToken({ pushToken: token, userId: id });
  }, [registerToken]);

  const handleEnableNotifications = async () => {
    await match(status)
      .with({ status: PermissionStatus.UNDETERMINED }, async () => {
        const { granted } = await requestPermission();
        if (granted) {
          await storeToken();
        }
      })
      .with({ status: PermissionStatus.DENIED }, () => openAppDeviceSettings("notifications"))
      .otherwise(() => {});

    bottomSheetRef.current?.dismiss();
  };

  useAppStatusEffect({
    onForeground: storeToken,
  });

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={[420]}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      )}
      handleStyle={{ opacity: 0.5 }}
      style={{ backgroundColor: "#fff" }}
      onDismiss={updateLastShownNotificationBottomSheet}
    >
      <Stack h="100%" p="$6" pb={insets.bottom} jc="space-between" ai="center">
        <Stack h={100} ai="center">
          <Lottie
            style={{ width: 150, height: 150, position: "absolute" }}
            source={notificationBell}
            autoPlay
            speed={1}
            loop={false}
          />
        </Stack>
        <Stack gap="$3" ai="center">
          <Typography type="SubHeaderHeavy">{t("enableNotifications")}</Typography>
          <Typography type="BodyLight" style={{ textAlign: "center" }}>
            {t("enableNotificationsDescription")}
          </Typography>
        </Stack>
        <ActionButton
          textStyle={{
            fontSize: 14,
          }}
          title={t("enable")}
          onPress={handleEnableNotifications}
        />
      </Stack>
    </BottomSheetModal>
  );
};

const LAST_SHOWN_NOTIFICATION_BOTTOM_SHEET_KEY = "lastShownNotificationBottomSheet";

const getLastShownNotificationBottomSheet = async () => {
  const lastShownNotificationBottomSheet = await AsyncStorage.getItem(
    LAST_SHOWN_NOTIFICATION_BOTTOM_SHEET_KEY
  );
  if (!lastShownNotificationBottomSheet) return null;
  return new Date(lastShownNotificationBottomSheet);
};

const updateLastShownNotificationBottomSheet = async () => {
  await AsyncStorage.setItem(LAST_SHOWN_NOTIFICATION_BOTTOM_SHEET_KEY, new Date().toISOString());
};
