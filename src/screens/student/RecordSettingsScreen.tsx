import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { RootStackParamList } from "navigation/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "RecordSettings">;

const RecordSettingsScreen: FunctionComponent<Props> = () => {
  return <Text>RecordSettingsScreen</Text>;
};

export default RecordSettingsScreen;
