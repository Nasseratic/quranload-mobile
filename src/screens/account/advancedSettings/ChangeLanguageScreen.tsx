import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { i18n } from "locales/config";
import QuranLoadView from "components/QuranLoadView";
import Typography from "components/Typography";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ChangeLanguage">;

const ChangeLanguageScreen: FunctionComponent<Props> = ({ navigation }) => {
  return (
    <QuranLoadView
      appBar={{
        title: i18n.t("changeLanguageScreen.title"),
      }}
    >
      <Typography>Some sort of dropdown?</Typography>
    </QuranLoadView>
  );
};

export default ChangeLanguageScreen;
