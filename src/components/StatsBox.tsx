import React, { FunctionComponent } from "react";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, Text, View } from "react-native";
import Typographies from "styles/Typographies";

interface Props {
  icon: string;
  label: string;
  value: string;
  backgroundColor: string;
}

const StatsBox: FunctionComponent<Props> = ({ icon, label, value, backgroundColor }) => {
  React;
  return (
    <View style={{ ...styles.container, backgroundColor: backgroundColor }}>
      <View style={styles.icon}></View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    borderRadius: GeneralConstants.BorderRadius.default,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    padding: GeneralConstants.Spacing.md,
  },
  icon: {
    height: 40,
    width: 40,
    backgroundColor: Colors.White[1],
    marginBottom: GeneralConstants.Spacing.sm,
  },
  label: {
    color: Colors.White[1],
    ...Typographies.caption.heavy,
  },
  value: {
    color: Colors.White[1],
    ...Typographies.caption.light,
  },
});

export default StatsBox;
