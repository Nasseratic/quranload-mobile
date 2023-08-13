import { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "constants/Colors";
import Typography from "components/Typography";

interface OwnProps {
  error?: string;
}

type Props = OwnProps;

const FormErrorView: FunctionComponent<Props> = ({ error }) => {
  if (error)
    return (
      <View style={styles.wrapper}>
        <Typography type="BodyHeavy" style={{ color: Colors.Error[1] }}>
          {error}
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
