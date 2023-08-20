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
import GeneralConstants from "constants/GeneralConstants";
import Typography from "components/Typography";

interface OwnProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress: () => void;
  title: string;
  isLoading?: boolean;
}

type Props = OwnProps;

const ActionButton: FunctionComponent<Props> = ({
  disabled,
  title,
  onPress,
  isLoading,
  style,
  textStyle,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.button, disabled ? styles.disabled : undefined, style]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={[styles.button, disabled ? styles.disabled : undefined, style]}
      disabled={disabled}
      onPress={onPress}
    >
      <Typography
        type="CaptionHeavy"
        style={[{ color: disabled ? Colors.Black[2] : Colors.White[1] }, textStyle]}
      >
        {title}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: GeneralConstants.Spacing.sm,
    backgroundColor: Colors.Success["1"],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: GeneralConstants.BorderRadius.sm,
    borderCurve: "continuous",
  },
  disabled: {
    backgroundColor: Colors.Gray["1"],
  },
});

export default ActionButton;
