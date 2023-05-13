import React, { FunctionComponent, useContext } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";
import QuranLoadView from "components/QuranLoadView";
import ActionBtn from "components/buttons/ActionBtn";
import AuthContext from "contexts/auth";
import Typography from "components/Typography";
import { i18n } from "locales/config";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Profile">;

const ProfileScreen: FunctionComponent<Props> = (props) => {
  const { signOut } = useContext(AuthContext);

  const handleSignout = async () => {
    await signOut();
  };

  return (
    <QuranLoadView>
      <Typography type="HeadlineHeavy">Avanceret indstillinger</Typography>
      <ActionBtn onPress={handleSignout} title={i18n.t("signOut")} />
    </QuranLoadView>
  );
};

export default ProfileScreen;
