import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Typography from "components/Typography";
import { i18n } from "locales/config";

const AccountNotAssociated = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.errorWrapper} onPress={() => null}>
        <View style={styles.errorDetail}>
          <Typography type="SubHeaderHeavy" style={{ color: Colors.Primary[1] }}>
            {i18n.t("studentDashboard.notAssociatedAnything")}
          </Typography>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    borderRadius: GeneralConstants.BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.Error[1],
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
