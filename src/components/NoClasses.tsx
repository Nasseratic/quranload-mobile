import { Colors } from "constants/Colors";
import GeneralConstants, { SCREEN_WIDTH } from "constants/GeneralConstants";
import { StyleSheet, View } from "react-native";
import Typography from "components/Typography";
import { t } from "locales/config";
import { EmptySvg } from "components/svgs/EmptySvg";
import ActionButton from "./buttons/ActionBtn";
import * as Linking from "expo-linking";
import { useMemo } from "react";

const NoClasses = ({ role }: { role: "teacher" | "student" }) => {
  const text = useMemo(
    () =>
      role === "teacher" ? t("teacherHomeScreen.noClasses") : t("studentDashboard.notEnrolled"),
    [role]
  );
  return (
    <View style={styles.container}>
      <EmptySvg size={SCREEN_WIDTH * 0.5} />
      <View style={styles.errorDetail}>
        <Typography
          type="TitleLight"
          style={{
            color: Colors.Black[2],
            textAlign: "center",
            width: 280,
          }}
        >
          {text}
        </Typography>
      </View>
      {role === "student" && (
        <View>
          <ActionButton
            title={t("studentDashboard.enroll")}
            onPress={() => Linking.openURL("https://www.quranload.com")}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 124,
    gap: GeneralConstants.Spacing.xl,
  },
  errorWrapper: {
    padding: GeneralConstants.Spacing.lg,
    flexDirection: "row",
    gap: GeneralConstants.Spacing.sm,
    alignItems: "center",
  },
  errorDetail: {
    flex: 1,
    flexDirection: "column",
  },
});

export default NoClasses;
