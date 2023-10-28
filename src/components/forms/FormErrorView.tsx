import { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "constants/Colors";
import Typography from "components/Typography";
import { AxiosError } from "axios";
import { match, P } from "ts-pattern";

const FormErrorView: FunctionComponent<{
  error?: string | AxiosError;
}> = ({ error }) => {
  const errorMsg = match(error)
    .with(P.string, (error) => error)
    .with({ response: { data: { message: P.select(P.string) } } }, (message) => {
      console.error(error);
      return message;
    })
    .otherwise(() => null);

  if (!errorMsg) return null;

  return (
    <View style={styles.wrapper}>
      <Typography type="BodyHeavy" style={{ color: Colors.Error[1] }}>
        {errorMsg}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    alignItems: "center",
  },
});

export default FormErrorView;
