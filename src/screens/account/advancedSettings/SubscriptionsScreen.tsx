import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import SubscriptionCard from "components/SubscriptionCard";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Subscriptions">;

const subscriptions: Frontend.Content.Subscription[] = [
  {
    id: "1345",
    name: "Niveau 2 - læsning",
    institution: "Munida",
    startDate: "01-01-2023",
    expireDate: "06-07-2023",
    nextPayment: "01-02-2034",
    frequence: "Monthly",
    amount: "150 dkk",
    image: "https://time.my-masjid.com//Uploads/b349b4c3-2a12-46a8-97fc-520480ade280-e590f.png",
  },
  {
    id: "2234",
    name: "Niveau 3 - læsning",
    institution: "Imam Malik Institut",
    startDate: "01-01-2023",
    expireDate: "06-07-2023",
    nextPayment: "01-02-2034",
    frequence: "Monthly",
    amount: "150 dkk",
    image: "https://time.my-masjid.com//Uploads/b349b4c3-2a12-46a8-97fc-520480ade280-e590f.png",
  },
  {
    id: "3456",
    name: "Niveau 6 - læsning",
    institution: "Al Bayan Odense",
    startDate: "01-01-2023",
    expireDate: "06-07-2023",
    nextPayment: "01-02-2034",
    frequence: "Monthly",
    amount: "150 dkk",
    image: "https://time.my-masjid.com//Uploads/b349b4c3-2a12-46a8-97fc-520480ade280-e590f.png",
  },
];

const SubscriptionScreen: FunctionComponent<Props> = ({ navigation }) => {
  const handleOnPress = (subscription: Frontend.Content.Subscription) => {
    navigation.navigate("CancelSubscription", {
      subscription,
    });
  };

  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("subscriptionsScreen.title"),
      }}
    >
      {subscriptions.map((subscription) => (
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
