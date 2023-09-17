import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "RecordSettings">;

const RecordSettingsScreen: FunctionComponent<Props> = () => {
  return <Text>RecordSettingsScreen</Text>;
};

export default RecordSettingsScreen;
