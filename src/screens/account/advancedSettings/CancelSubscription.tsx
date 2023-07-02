import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import Typography from "components/Typography";
import ActionButton from "components/buttons/ActionBtn";
import { Colors } from "constants/Colors";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "CancelSubscription">;

const CancelSubscriptionScreen: FunctionComponent<Props> = ({ navigation }) => {
  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("cancelSubscriptionScreen.title"),
      }}
    >
      <Typography type="SubHeaderLight">
        {i18n.t("cancelSubscriptionScreen.description")}
      </Typography>
      <ActionButton
        style={{
          backgroundColor: Colors.Error[1],
        }}
        onPress={() => console.log("update password")}
        title={i18n.t("cancelSubscriptionScreen.cancelSubscription")}
      />
    </QuranLoadView>
  );
};

export default CancelSubscriptionScreen;
