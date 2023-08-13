import { FunctionComponent, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import Typography from "components/Typography";
import Card from "components/Card";
import { View, Alert } from "react-native";
import GeneralConstants from "constants/GeneralConstants";
import ActionButton from "components/buttons/ActionBtn";
import { Colors } from "constants/Colors";
import { fDate } from "utils/formatTime";
import { cancelSubscription } from "services/profileService";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "CancelSubscription">;

const CancelSubscriptionScreen: FunctionComponent<Props> = ({ route, navigation }) => {
  const { subscription } = route.params;
  const [submitting, setSubmitting] = useState(false);
  const handleCancelSubscription = () => {
    setSubmitting(true);
    cancelSubscription(subscription.teamId)
      .then(() => {
        Alert.alert(i18n.t("cancelSubscriptionScreen.subscriptionCancelled"));
        navigation.goBack();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setSubmitting(false));
  };
  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("cancelSubscriptionScreen.title"),
      }}
    >
      <Card style={{ padding: GeneralConstants.Spacing.md, gap: GeneralConstants.Spacing.xxs }}>
        <TextRow label="Name" value={subscription.teamName} />
        <TextRow label="Organization" value={subscription.organizationName} />
        <TextRow label="Start date" value={fDate(subscription.enrollmentDate)} />
        <TextRow label="Expires" value={fDate(subscription.expiredAtDate)} />
        <TextRow label="Next payment" value={fDate(subscription.renewalDate)} />
        {/*<TextRow label="Frequence" value={subscription.frequence} />*/}
        <TextRow label="Amount" value={`${subscription.paidAmount} DKK`} />
        <ActionButton
          isLoading={submitting}
          style={{ backgroundColor: Colors.Error[1], marginTop: GeneralConstants.Spacing.xxs }}
          onPress={handleCancelSubscription}
          title={"Cancel subscription"}
        />
      </Card>
    </QuranLoadView>
  );
};

interface TextRowProps {
  label: string;
  value: string;
}
const TextRow: FunctionComponent<TextRowProps> = ({ label, value }) => {
  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      <Typography type="CaptionHeavy">{label}: </Typography>
      <Typography type="CaptionLight">{value}</Typography>
    </View>
  );
};

export default CancelSubscriptionScreen;
