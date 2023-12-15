import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import Typography from "components/Typography";
import { RootStackParamList } from "navigation/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBar } from "components/AppBar";

type Props = NativeStackScreenProps<RootStackParamList, "ChangeLanguage">;

const ChangeLanguageScreen: FunctionComponent<Props> = () => {
  return (
    <SafeAreaView>
      <AppBar title={i18n.t("changeLanguageScreen.title")} />
      <Typography>Some sort of dropdown?</Typography>
    </SafeAreaView>
  );
};

export default ChangeLanguageScreen;
