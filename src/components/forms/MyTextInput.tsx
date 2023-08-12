import { Colors } from "constants/Colors";
import React, { FunctionComponent, useState } from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import Typography from "components/Typography";
import typographiesStyles from "styles/typographies";
import GeneralConstants from "constants/GeneralConstants";

interface OwnProps {
  label?: string;
  error: string | undefined;
  touched: boolean | undefined;
  value: string | undefined;
  autoCompleteType?: KeyboardTypeOptions | undefined;
  placeHolder: string;
  onBlur?: {
    (e: React.FocusEvent<Element, Element>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  onChange: (name: string) => void;
  editable?: boolean;
  autofocus?: boolean;
  textarea?: boolean;
}

type Props = OwnProps;

const MyTextInput: FunctionComponent<Props> = ({
  label,
  editable,
  value,
  error,
  onChange,
  touched,
  onBlur,
  autoCompleteType,
  placeHolder,
  autofocus,
  textarea,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleOnBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View>
      {label && (
        <Typography
          type="BodyHeavy"
          style={{
            marginBottom: GeneralConstants.Spacing.xs,
            color: isFocused ? Colors.Primary[1] : Colors.Black[2],
          }}
        >
          {label}
        </Typography>
      )}

      <TextInput
        keyboardType={autoCompleteType}
        returnKeyType="next"
        editable={editable}
        autoFocus={autofocus}
        placeholder={placeHolder}
        onChangeText={onChange}
        onBlur={handleOnBlur}
        onFocus={() => setIsFocused(true)}
        style={[styles.input, error && touched ? styles.error : null, isFocused && styles.focused]}
        value={value}
        multiline={textarea}
        numberOfLines={textarea ? 10 : 1}
      />
      {touched && error && <Text style={{ marginVertical: 4 }}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    padding: GeneralConstants.Spacing.sm,
    backgroundColor: Colors.White[1],
    color: Colors.Black[2],
    borderColor: Colors.Gray[1],
    borderWidth: 2,
    borderRadius: GeneralConstants.BorderRadius.xs,
    ...typographiesStyles.CaptionLight,
  },
  focused: {
    borderColor: Colors.Primary[1],
    color: Colors.Primary[1],
  },
  error: {
    borderColor: Colors.Error[1],
  },
});

export default MyTextInput;
