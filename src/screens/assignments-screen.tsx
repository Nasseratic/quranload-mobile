import React from "react";
import { Button, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";

type Props = NativeStackScreenProps<
  Frontend.Navigation.RootStackParamList,
  "Assignments"
>;
const AssignmentsScreen = ({ navigation }: Props) => {
  return (
    <QuranLoadView>
      <Text>Assignments Screen</Text>
      <Button title="Go to Home" onPress={() => navigation.navigate("Home")} />
    </QuranLoadView>
  );
};

export default AssignmentsScreen;
