import { Colors } from "constants/Colors";
import GeneralConstants, { SCREEN_WIDTH } from "constants/GeneralConstants";
import { StyleSheet, View } from "react-native";
import Typography from "components/Typography";
import { t } from "locales/config";
import { EmptySvg } from "components/svgs/EmptySvg";
import ActionButton from "./buttons/ActionBtn";
import * as Linking from "expo-linking";

const AccountNotAssociated = () => {
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
          {t("studentDashboard.notEnrolled")}
        </Typography>
      </View>
      <View>
        <ActionButton
          title={t("studentDashboard.enroll")}
          onPress={() => Linking.openURL("https://www.quranload.com")}
        />
      </View>
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

export default AccountNotAssociated;
