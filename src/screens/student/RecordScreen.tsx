import React, { FunctionComponent } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Record">;

const RecordScreen: FunctionComponent<Props> = () => {
  return <Text>RecordScreen</Text>;
};

export default RecordScreen;
