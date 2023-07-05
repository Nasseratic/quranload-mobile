import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import Typography from "components/Typography";
import Card from "components/Card";
import { View, StyleSheet } from "react-native";
import GeneralConstants from "constants/GeneralConstants";
import ActionButton from "components/buttons/ActionBtn";
import { Colors } from "constants/Colors";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "CancelSubscription">;

const CancelSubscriptionScreen: FunctionComponent<Props> = ({ route }) => {
  const { subscription } = route.params;
  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("cancelSubscriptionScreen.title"),
      }}
    >
      <Card style={{ padding: GeneralConstants.Spacing.md, gap: GeneralConstants.Spacing.xxs }}>
        <TextRow label="Name" value={subscription.name} />
        <TextRow label="Organization" value={subscription.institution} />
        <TextRow label="Start date" value={subscription.startDate} />
        <TextRow label="Expires" value={subscription.expireDate} />
        <TextRow label="Next payment" value={subscription.nextPayment} />
        <TextRow label="Frequence" value={subscription.frequence} />
        <TextRow label="Amount" value={subscription.amount} />
        <ActionButton
          style={{ backgroundColor: Colors.Error[1], marginTop: GeneralConstants.Spacing.xxs }}
          onPress={() => null}
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
