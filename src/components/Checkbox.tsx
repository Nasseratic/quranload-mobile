import React from "react";
import ExpoCheckbox, { CheckboxProps as ExpoCheckboxProps } from "expo-checkbox";
import { StyleSheet } from "react-native";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";

const Checkbox = ({ ...rest }: ExpoCheckboxProps) => {
  return <ExpoCheckbox style={styles.checkbox} color={Colors.Success[1]} {...rest} />;
};

const styles = StyleSheet.create({
  checkbox: {
    height: 18.5,
    width: 18.5,
    borderRadius: GeneralConstants.BorderRadius.xxs,
  },
});

export default Checkbox;
