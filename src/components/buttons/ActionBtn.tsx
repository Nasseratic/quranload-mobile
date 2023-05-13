import React, { FunctionComponent } from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  Text,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
  View,
} from "react-native";
import { Colors } from "constants/Colors";

interface OwnProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress: () => void;
  title: string;
  isSubmitting?: boolean;
}

type Props = OwnProps;

const ActionButton: FunctionComponent<Props> = ({
  disabled,
  title,
  onPress,
  isSubmitting,
  style,
  textStyle,
}) => {
  if (isSubmitting) {
    return (
      <View>
        <ActivityIndicator style={{ backgroundColor: Colors.Accent["1"] }} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={[disabled ? styles.disabled : styles.button, style]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 55,
    backgroundColor: Colors.Success["1"],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    marginTop: 10,
  },
  disabled: {
    width: "100%",
    height: 55,
    backgroundColor: Colors.Gray["1"],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
    color: Colors.Primary["1"],
  },
});

export default ActionButton;
