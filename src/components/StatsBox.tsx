import React, { FunctionComponent } from "react";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, View } from "react-native";
import Typography from "components/Typography";
interface Props {
  icon: JSX.Element;
  label: string;
  value: string;
  backgroundColor: string;
}

const StatsBox: FunctionComponent<Props> = ({ icon, label, value, backgroundColor }) => {
  React;
  return (
    <View style={{ ...styles.container, backgroundColor: backgroundColor }}>
      {icon}
      <Typography
        type="CaptionHeavy"
        style={{
          color: Colors.White[1],
        }}
      >
        {label}
      </Typography>
      <Typography
        type="CaptionLight"
        style={{
          color: Colors.White[1],
        }}
      >
        {value}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexBasis: 1,
    borderRadius: GeneralConstants.BorderRadius.xl,
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
});

export default StatsBox;
