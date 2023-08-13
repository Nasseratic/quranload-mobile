import { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { MushafPages } from "components/Mushaf/MushafPages";
import { RecordScreenRecorder } from "./RecordScreenRecorder";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Record">;

export const RecordScreen: FunctionComponent<Props> = () => {
  return (
    <View style={{ flex: 1 }}>
      <MushafPages />
      <RecordScreenRecorder />
    </View>
  );
};
