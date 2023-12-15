import { FunctionComponent, useContext, useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import Menu from "components/menu/Menu";
import { KeyIcon, SadFaceIcon } from "assets/icons";
import { Colors } from "constants/Colors";
import { IMenuItemProps } from "components/menu/MenuItem";
import ActionButton from "components/buttons/ActionBtn";
import AuthContext from "contexts/auth";
import Typography from "components/Typography";
import * as Updates from "expo-updates";
import { RootStackParamList } from "navigation/navigation";
import { AppBar } from "components/AppBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "tamagui";
type Props = NativeStackScreenProps<RootStackParamList, "AdvancedSettings">;

const AdvancedSettingsScreen: FunctionComponent<Props> = ({ navigation }) => {
  const { signOut, user } = useContext(AuthContext);

  const handleSignout = async () => {
    await signOut();
  };

  const menuItems = useMemo(() => {
    const items: IMenuItemProps[] = [
      {
        text: i18n.t("advancedSettingsScreen.changePassword"),
        onPress: () => navigation.navigate("ChangePassword"),
        icon: <KeyIcon color={Colors.Primary[1]} />,
      },
    ];
    console.log(user?.roles);

    const studentRole = user?.roles.indexOf("Student");

    if (studentRole !== undefined && studentRole >= 0) {
      items.push({
        text: i18n.t("advancedSettingsScreen.cancelSubscription"),
        onPress: () => navigation.navigate("Subscriptions"),
        icon: <SadFaceIcon color={Colors.Primary[1]} />,
      });
    }

    return items;
  }, [navigation, user?.roles]);

  return (
    <SafeAreaView>
      <AppBar title={i18n.t("advancedSettingsScreen.title")} />
      <View gap={16} paddingHorizontal={16}>
        <Menu menuItems={menuItems} />
        <ActionButton
          style={{ backgroundColor: Colors.Error["1"] }}
          onPress={handleSignout}
          title={i18n.t("signOut")}
        />

        <Typography style={{ alignSelf: "flex-end", fontSize: 10, color: Colors.Black[2] }}>
          Version: {(Updates.updateId ?? "").slice(0, 7)}
        </Typography>
      </View>
    </SafeAreaView>
  );
};

export default AdvancedSettingsScreen;
