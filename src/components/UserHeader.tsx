import React, { useContext, useEffect, useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import Typography from "components/Typography";
import { CogIcon } from "assets/icons";
import AuthContext from "contexts/auth";
import { Colors } from "constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { XStack, Stack, Sheet } from "tamagui";
import { ChatIcon } from "./icons/ChatIcon";
import { SupportIcon } from "./icons/SupportIcon";
import { useFeatureFlags } from "hooks/queries/useFeatureFlags";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "locales/config";

const SUPPORT_BOTTOM_SHEET_KEY = "hasSeenSupportBottomSheet";

// Helper function to check if bottom sheet should be shown
const shouldShowSupportBottomSheet = async (): Promise<boolean> => {
  try {
    const hasSeenBottomSheet = await AsyncStorage.getItem(SUPPORT_BOTTOM_SHEET_KEY);
    console.log("hasSeenBottomSheet value:", hasSeenBottomSheet); // Debug log
    return hasSeenBottomSheet !== "true";
  } catch (error) {
    console.error("Error checking support bottom sheet status:", error);
    return false;
  }
};

// Helper function to mark bottom sheet as seen
const markSupportBottomSheetAsSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(SUPPORT_BOTTOM_SHEET_KEY, "true");
  } catch (error) {
    console.error("Error marking support bottom sheet as seen:", error);
  }
};

// Local component for the support bug report sheet
const SupportBugReportSheet: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => Promise<void>;
}> = ({ open, onOpenChange, onClose }) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={async (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          await onClose();
        }
      }}
      snapPointsMode="fit"
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        backgroundColor="rgba(0, 0, 0, 0.3)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame
        padding="$4"
        paddingBottom={bottom + 24}
        gap="$4"
        backgroundColor="white"
        borderTopLeftRadius="$4"
        borderTopRightRadius="$4"
      >
        <Stack gap="$3" ai="center" px="$2">
          {/* Support Icon Display */}
          <Stack
            ai="center"
            jc="center"
            backgroundColor={Colors.Primary[1]}
            borderRadius="$10"
            padding="$3"
            marginBottom="$1"
          >
            <SupportIcon size={32} color="white" />
          </Stack>

          <Typography type="SubHeaderHeavy" style={{ color: Colors.Primary[1] }}>
            {t("support.bottomSheet.title")}
          </Typography>
          <Typography
            type="BodyLight"
            style={{ color: Colors.Black[1], textAlign: "center", lineHeight: 22 }}
          >
            {t("support.bottomSheet.description")}
          </Typography>
          <Typography type="CaptionLight" style={{ color: Colors.Black[2], textAlign: "center" }}>
            {t("support.bottomSheet.actionText")}
          </Typography>
        </Stack>
      </Sheet.Frame>
    </Sheet>
  );
};

const UserHeader = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { ff } = useFeatureFlags();
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Debug effect to log bottom sheet state changes
  useEffect(() => {
    console.log("Bottom sheet state changed:", showBottomSheet);
  }, [showBottomSheet]);

  // Check if bottom sheet should be shown when support chat feature is enabled
  useEffect(() => {
    if (user && ff?.supportChat) {
      const checkBottomSheet = async () => {
        const shouldShow = await shouldShowSupportBottomSheet();
        console.log("Should show bottom sheet:", shouldShow); // Debug log
        if (shouldShow) {
          setShowBottomSheet(true);
        }
      };
      checkBottomSheet();
    }
  }, [user, ff?.supportChat]);

  const handleBottomSheetClose = async () => {
    await markSupportBottomSheetAsSeen();
    setShowBottomSheet(false);
  };

  if (!user) return;

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Pressable
        onLongPress={() => {
          navigation.navigate("Mushaf");
        }}
      >
        <Typography type="BodyLight" style={{ opacity: 0.5 }}>
          Assalamu alykum,
        </Typography>
      </Pressable>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography type="HeadlineHeavy">{user?.fullName}</Typography>
        <XStack gap={16} jc="center" ai="center">
          {user && ff?.supportChat && (
            <>
              <TouchableOpacity
                hitSlop={10}
                onPress={() =>
                  navigation.navigate("ChatScreen", {
                    title: "Support",
                    supportChat: true,
                  })
                }
                onLongPress={async () => {
                  // Clear the bottom sheet state for testing
                  await AsyncStorage.removeItem(SUPPORT_BOTTOM_SHEET_KEY);
                  setShowBottomSheet(true);
                  console.log("Reset bottom sheet - should show now");
                }}
              >
                <SupportIcon size={20} color={Colors.Primary[1]} />
              </TouchableOpacity>

              <SupportBugReportSheet
                open={showBottomSheet}
                onOpenChange={setShowBottomSheet}
                onClose={handleBottomSheetClose}
              />
            </>
          )}
          {user && ff?.chat && (
            <TouchableOpacity hitSlop={10} onPress={() => navigation.navigate("ChatListScreen")}>
              <ChatIcon size={20} color={Colors.Primary[1]} />
            </TouchableOpacity>
          )}

          <TouchableOpacity hitSlop={10} onPress={() => navigation.navigate("Profile")}>
            <CogIcon width={20} height={18} color={Colors.Primary[1]} />
          </TouchableOpacity>
        </XStack>
      </View>
    </View>
  );
};

export default UserHeader;
