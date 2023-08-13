import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { FunctionComponent } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import Typography from "./Typography";
import { fDate } from "utils/formatTime";

interface Props {
  subscription: Frontend.Content.Subscription;
  onPress: () => void;
}

const SubscriptionCard: FunctionComponent<Props> = ({ subscription, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        style={styles.institutionImage}
        source={{
          uri: "https://quranload-lp-dev-app.azurewebsites.net/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmosque.d8bc985e.jpg&w=384&q=75",
        }}
      />
      <View style={styles.institutionInfo}>
        <Typography type="SubHeaderHeavy" style={{ color: Colors.Primary[1] }}>
          {subscription.teamName}
        </Typography>
        <Typography type="CaptionLight" style={{ color: Colors.Black[2] }}>
          {subscription.organizationName}
        </Typography>
        <Typography type="BodyLight" style={{ color: Colors.Black[2] }}>
          Renews at: {fDate(subscription.renewalDate)}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: GeneralConstants.BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.Gray[1],
    padding: GeneralConstants.Spacing.lg,
    flexDirection: "row",
    gap: GeneralConstants.Spacing.sm,
  },
  institutionImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  institutionInfo: {
    flexShrink: 1,
  },
  text: {
    flexWrap: "wrap",
  },
});
export default SubscriptionCard;
