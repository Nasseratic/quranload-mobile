import { FunctionComponent, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import SubscriptionCard from "components/SubscriptionCard";
import { fetchSubscriptions } from "services/profileService";
import { Loader } from "components/Loader";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Subscriptions">;
const SubscriptionScreen: FunctionComponent<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Frontend.Content.Subscription[]>();
  const handleOnPress = (subscription: Frontend.Content.Subscription) => {
    navigation.navigate("CancelSubscription", {
      subscription,
    });
  };

  useEffect(() => {
    void fetchSubscriptions()
      .then((res) => {
        setSubscriptions(res.list);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader />;

  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("subscriptionsScreen.title"),
      }}
    >
      {subscriptions &&
        subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onPress={() => handleOnPress(subscription)}
          />
        ))}
    </QuranLoadView>
  );
};

export default SubscriptionScreen;
