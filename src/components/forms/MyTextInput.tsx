import { Colors } from "constants/Colors";
import Typographies from "styles/typographies";
import React, { FunctionComponent } from "react";
import { StyleSheet, TextInput, Text, View, KeyboardTypeOptions } from "react-native";

interface OwnProps {
  label?: string;
  error: string | undefined;
  touched: boolean | undefined;
  value: string | undefined;
  autoCompleteType?: KeyboardTypeOptions | undefined;
  placeHolder: string;
  handleBlur?: {
    (e: React.FocusEvent<any, Element>): void;
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
  };
  handleChange: (name: string) => void;
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
  handleChange,
  touched,
  handleBlur,
  autoCompleteType,
  placeHolder,
  autofocus,
  textarea,
}) => {
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        keyboardType={autoCompleteType}
        returnKeyType="next"
        editable={editable}
        autoFocus={autofocus}
        placeholder={placeHolder}
        onChangeText={handleChange}
        onBlur={handleBlur}
        style={[
          styles.input,
          {
            height: textarea ? 100 : 50,
          },
          error && touched ? styles.error : null,
        ]}
        value={value}
        multiline={textarea}
        numberOfLines={textarea ? 10 : 1}
      />
      {touched && error && <Text style={{ marginVertical: 4 }}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...Typographies.CaptionLight,
    color: Colors.White["1"],
    fontSize: 14,
    marginTop: 15,
  },
  input: {
    backgroundColor: Colors.White["1"],
    borderRadius: 4,
    color: Colors.Primary["1"],
    borderWidth: 1,
    borderColor: Colors.Gray["3"],
    marginTop: 4,
    paddingHorizontal: 10,
  },
  error: {
    borderColor: Colors.Error["1"],
  },
});

export default MyTextInput;
