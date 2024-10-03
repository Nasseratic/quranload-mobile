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
import { EyeIcon } from "components/icons/EyeIcon";
import { EyeOffIcon } from "components/icons/EyeOffIcon";
import { Button, Stack } from "tamagui";

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
  isSecure?: boolean;
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
  isSecure,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureOn, setIsSecureOn] = useState(isSecure);

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

      <Stack>
        <TextInput
          keyboardType={autoCompleteType}
          returnKeyType="next"
          editable={editable}
          autoFocus={autofocus}
          placeholder={placeHolder}
          onChangeText={onChange}
          onBlur={handleOnBlur}
          onFocus={() => setIsFocused(true)}
          style={[
            styles.input,
            error && touched ? styles.error : null,
            isFocused && styles.focused,
            isSecure && { paddingRight: 50 },
          ]}
          value={value}
          multiline={textarea}
          numberOfLines={textarea ? 10 : 1}
          secureTextEntry={isSecureOn}
        />
        <Button
          position="absolute"
          right={8}
          pressStyle={{ opacity: 0.5, borderWidth: 0 }}
          variant="outlined"
          w={25}
          onPress={() => setIsSecureOn(!isSecureOn)}
        >
          {isSecure && (isSecureOn ? <EyeOffIcon /> : <EyeIcon />)}
        </Button>
      </Stack>
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
