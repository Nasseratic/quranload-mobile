import { Colors } from "constants/Colors";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export const Loader = ({ light = true }: { light?: boolean }) => {
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        {
          alignItems: "center",
          backgroundColor: light ? Colors.White["1"] : Colors.Primary["1"],
          justifyContent: "center",
          minHeight: 200,
          width: SCREEN_WIDTH,
        },
      ]}
    >
      <StatusBar style={light ? "dark" : "light"} />
      <ActivityIndicator color={light ? "#000" : "#fff"} size="large" />
    </View>
  );
};
