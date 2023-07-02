import React, { FunctionComponent } from "react";
import { Colors } from "constants/Colors";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

const Loader: FunctionComponent = () => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: Colors.Primary["1"],
        justifyContent: "center",
      }}
    >
      <StatusBar style="light" />
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
};

export default Loader;
