import React from "react";
import { Text, Button, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import QuranLoadView from "components/QuranLoadView";
import Typographies from "styles/Typographies";
import StatsBox from "components/StatsBox";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";

type Props = NativeStackScreenProps<Frontend.Navigation.RootStackParamList, "Home">;

const HomeScreen = ({ navigation }: Props) => {
  return (
    <QuranLoadView>
      <Text style={Typographies.display.heavy}>Home Screen</Text>
      <Button title="Go to Assignments" onPress={() => navigation.navigate("Assignments")} />
      <View
        style={{
          flexDirection: "row",
          gap: GeneralConstants.Spacing.md,
        }}
      >
        <StatsBox
          icon=""
          label="Time pr page"
          value="2.5 min"
          backgroundColor={Colors.Primary[1]}
        />
        <StatsBox
          icon=""
          label="Time pr page"
          value="2.5 min"
          backgroundColor={Colors.Success[1]}
        />
      </View>
    </QuranLoadView>
  );
};

export default HomeScreen;
