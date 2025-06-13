import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GeneralConstants from "constants/GeneralConstants";
import { Stack, YStack } from "tamagui";
import { Colors } from "constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeftIcon } from "assets/icons";
import Typography from "components/Typography";
import { t } from "locales/config";

export const MUSHUF_PAGE_HEADER_HEIGHT = 50;

export const MushafPagesHeader = ({
  surahName,
  currentPageNumber,
  pageOrderInHW,
  numberOfPagesInHW,
}: {
  surahName: string;
  currentPageNumber: number;
  pageOrderInHW: number;
  numberOfPagesInHW: number;
}) => {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();

  return (
    <Stack
      style={[
        styles.appBar,
        {
          paddingTop: insets.top,
          height: MUSHUF_PAGE_HEADER_HEIGHT + insets.top,
        },
      ]}
    >
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

const styles = StyleSheet.create({
  appBar: {
    zIndex: 1,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingRight: GeneralConstants.Spacing.md,
    paddingLeft: 0,
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
  },
  goBackButton: {
    paddingVertical: GeneralConstants.Spacing.md,
    paddingRight: GeneralConstants.Spacing.md,
    paddingLeft: GeneralConstants.Spacing.md,
  },
  title: {
    color: Colors.Primary[1],
    lineHeight: 16,
  },
});
