import React from "react";
import { Text, Button } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import typographies from "styles/typographies";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Home">;

const HomeScreen = ({ navigation }: Props) => {
  return (
    <QuranLoadView>
      <Text style={typographies.h1}>Home Screen</Text>
      <Button title="Go to Assignments" onPress={() => navigation.navigate("Assignments")} />
    </QuranLoadView>
  );
};

export default HomeScreen;
