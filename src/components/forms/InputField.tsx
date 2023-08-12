import { useState } from "react";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { FunctionComponent } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import typographiesStyles from "styles/typographies";

interface Props extends Omit<TextInputProps, "editable"> {
  label?: string;
  touched?: boolean;
  error?: string;
  disabled?: boolean;
}

const InputField: FunctionComponent<Props> = ({
  label,
  error,
  touched,
  onFocus,
  onBlur,
  disabled,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleOnFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleOnBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      {label && <Typography type="BodyHeavy">{label}</Typography>}
      <TextInput
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        editable={!disabled}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          disabled && styles.inputDisabled,
          error && touched ? styles.inputError : null,
        ]}
        {...rest}
      />
      {error && touched && (
        <Typography type="BodyLight" style={styles.textError}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: GeneralConstants.Spacing.xxs,
  },
  input: {
    padding: GeneralConstants.Spacing.sm,
    backgroundColor: Colors.White[1],
    color: Colors.Black[2],
    borderColor: Colors.Black[4],
    borderWidth: 2,
    borderRadius: GeneralConstants.BorderRadius.xs,
    ...typographiesStyles.CaptionLight,
  },
  inputFocused: {
    borderColor: Colors.Primary[1],
    shadowColor: Colors.Primary[1],
    shadowOffset: { height: 2, width: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.2,
    color: Colors.Primary[1],
  },
  inputError: {
    borderColor: Colors.Error[1],
  },
  inputDisabled: {
    backgroundColor: Colors.Black[5],
  },
  textError: {
    color: Colors.Error[1],
  },
});

export default InputField;
