import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { FunctionComponent } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Typography from "./Typography";
import { fDate } from "utils/formatTime";
import { Image } from "expo-image";

interface Props {
  subscription: Frontend.Content.Subscription;
  onPress: () => void;
}

const SubscriptionCard: FunctionComponent<Props> = ({ subscription, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image style={styles.institutionImage} contentFit="cover" source={subscription.image} />
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
