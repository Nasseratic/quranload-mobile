import React, { Children, useMemo } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import GeneralConstants from "constants/GeneralConstants";
import AppBar from "components/AppBar";
import { Stack, XStack, YStack } from "tamagui";
import { color } from "@tamagui/themes";
import { Colors } from "constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeftIcon } from "assets/icons";
import Typography from "components/Typography";
import { t } from "locales/config";

const MUSHUF_PAGE_HEADER_HEIGHT = 54;

const insets = useSafeAreaInsets();

const styles = {
  appBar: {
    zIndex: 1,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 20,
    height: MUSHUF_PAGE_HEADER_HEIGHT,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingRight: GeneralConstants.Spacing.md,
    paddingLeft: 0,
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
    top: insets.top,
  },
  goBackButton: {
    paddingVertical: GeneralConstants.Spacing.md,
    paddingRight: GeneralConstants.Spacing.md,
    paddingLeft: GeneralConstants.Spacing.md,
  },
  title: {
    color: Colors.Primary[1],
    // fontSize: 12,
    // fontFamily: "Noto Sans",
    // fontWeight: "600",
    lineHeight: 16,
  },
};

export const MushafPagesHeader = ({
  surahName,
  currentPageNumber,
  pageOrderInHW,
  numberOfPagesInHW,
}: {
  surahName: string,
  currentPageNumber: number,
  pageOrderInHW: number,
  numberOfPagesInHW: number,
}) => {
  const navigation = useNavigation();

  return (
    <Stack style={styles.appBar}>
      {/* back button */}
      <TouchableOpacity style={styles.goBackButton} onPress={navigation.goBack}>
        <ChevronLeftIcon color={Colors.Primary[1]} />
      </TouchableOpacity>
      {/* surah name & page number */}
      <YStack f={1} paddingRight={24} alignItems="center">
        <Typography style={styles.title}>{surahName}</Typography>
        <Typography style={styles.title}>{`${t(
          "assignmentScreen.page"
        )} ${currentPageNumber} (${pageOrderInHW} ${t(
          "assignmentScreen.outOf"
        )} ${numberOfPagesInHW})`}</Typography>
      </YStack>
    </Stack>
  );
};
