import React, { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { i18n } from "locales/config";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "AdvancedSettings">;

const AdvancedSettingsScreen: FunctionComponent<Props> = () => {
  return <Text>{i18n.t("advancedSettings")}</Text>;
};

export default AdvancedSettingsScreen;
