import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import Menu from "components/menu/Menu";
import { GlobeIcon, KeyIcon, SadFaceIcon } from "assets/icons";
import { Colors } from "constants/Colors";
import { IMenuItemProps } from "components/menu/MenuItem";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "AdvancedSettings">;

const AdvancedSettingsScreen: FunctionComponent<Props> = ({ navigation }) => {
  const menuItems: IMenuItemProps[] = [
    {
      text: i18n.t("advancedSettingsScreen.changePassword"),
      onPress: () => navigation.navigate("ChangePassword"),
      icon: <KeyIcon color={Colors.Primary[1]} />,
    },
    {
      text: i18n.t("advancedSettingsScreen.changeLanguage"),
      onPress: () => navigation.navigate("ChangeLanguage"),
      icon: <GlobeIcon color={Colors.Primary[1]} />,
    },
    {
      text: i18n.t("advancedSettingsScreen.cancelSubscription"),
      onPress: () => navigation.navigate("CancelSubscription"),
      icon: <SadFaceIcon color={Colors.Primary[1]} />,
    },
  ];

  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("advancedSettingsScreen.title"),
      }}
    >
      <Menu menuItems={menuItems} />
    </QuranLoadView>
  );
};

export default AdvancedSettingsScreen;
