import React, { FunctionComponent } from "react";
import { Colors } from "constants/Colors";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

interface Probs {
  light?: boolean;
}
const Loader: FunctionComponent<Probs> = ({ light }) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: light ? Colors.White["1"] : Colors.Primary["1"],
        justifyContent: "center",
      }}
    >
      <StatusBar style="light" />
      <ActivityIndicator color={light ? "#000" : "#fff"} size="large" />
    </View>
  );
};

export default Loader;
