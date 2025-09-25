import { useMemo, useState } from "react";
import { Modal, StyleSheet, View, Linking, Platform } from "react-native";
import Constants from "expo-constants";
import { Button, XStack, YStack } from "tamagui";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { cvx, useCvxQuery } from "api/convex";

const PLAY_STORE_URL =
  `https://play.google.com/store/apps/details?id=${Constants.expoConfig?.android?.package ?? ""}`;
const APP_STORE_SEARCH_URL = "https://apps.apple.com/us/search?term=quranload";

export const AppUpdateModal = () => {
  const [dismissed, setDismissed] = useState(false);
  const remoteVersion = useCvxQuery(cvx.appVersion.latest);
  const currentVersion = Constants.expoConfig?.version;

  const shouldShowModal = useMemo(() => {
    if (dismissed) return false;
    if (!remoteVersion || !currentVersion) return false;

    return remoteVersion !== currentVersion;
  }, [remoteVersion, currentVersion, dismissed]);

  const storeUrl = useMemo(() => {
    return Platform.select({
      ios: APP_STORE_SEARCH_URL,
      android: PLAY_STORE_URL,
      default: PLAY_STORE_URL,
    });
  }, []);

  return (
    <Modal visible={shouldShowModal} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <YStack
          bg={Colors.White[1]}
          borderRadius={16}
          padding={24}
          alignItems="center"
          gap={16}
          width="100%"
          maxWidth={360}
        >
          <Typography type="HeadlineHeavy" style={styles.title}>
            Update available
          </Typography>
          <Typography type="BodyLight" style={styles.description}>
            A newer version of Quranload is available. Please update the app to continue enjoying the
            latest experience.
          </Typography>
          <Typography type="SmallLight" style={styles.versionInfo}>
            Current version: {currentVersion ?? "Unknown"}
            {"\n"}Latest version: {remoteVersion ?? "Unknown"}
          </Typography>
          <XStack gap={12} width="100%">
            <Button
              flex={1}
              height={48}
              backgroundColor={Colors.Primary[3]}
              onPress={() => {
                if (storeUrl) Linking.openURL(storeUrl);
              }}
            >
              <Typography type="BodyHeavy" style={styles.primaryActionText}>
                Go to store
              </Typography>
            </Button>
            <Button
              flex={1}
              height={48}
              backgroundColor={Colors.White[1]}
              borderWidth={1}
              borderColor={Colors.Primary[3]}
              onPress={() => setDismissed(true)}
            >
              <Typography type="BodyHeavy" style={styles.secondaryActionText}>
                Cancel
              </Typography>
            </Button>
          </XStack>
        </YStack>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.Black[3],
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    color: Colors.Primary[1],
    textAlign: "center",
  },
  description: {
    color: Colors.Black[1],
    textAlign: "center",
  },
  versionInfo: {
    color: Colors.Black[2],
    textAlign: "center",
  },
  primaryActionText: {
    color: Colors.White[1],
  },
  secondaryActionText: {
    color: Colors.Primary[3],
  },
});
