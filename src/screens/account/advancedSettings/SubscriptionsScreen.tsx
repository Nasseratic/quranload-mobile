import { FunctionComponent, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import SubscriptionCard from "components/SubscriptionCard";
import { fetchSubscriptions } from "services/profileService";
import { Loader } from "components/Loader";
import { RootStackParamList } from "navigation/navigation";
import { AppBar } from "components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native";
import NoClasses from "components/NoClasses";

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
    <SafeAreaView style={{ flex: 1 }}>
      <AppBar title={i18n.t("subscriptionsScreen.title")} />
      <FlatList
        data={subscriptions}
        keyExtractor={(subscription) => subscription.id}
        ListEmptyComponent={<NoClasses role="student" />}
        renderItem={({ item }) => (
          <SubscriptionCard key={item.id} subscription={item} onPress={() => handleOnPress(item)} />
        )}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
          paddingBottom: subscriptions?.length && 16,
        }}
      />
    </SafeAreaView>
  );
};

export default SubscriptionScreen;
