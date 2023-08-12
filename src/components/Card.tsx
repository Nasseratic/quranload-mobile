import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { View, ViewProps, StyleSheet } from "react-native";

const Card = ({ children, style, ...rest }: ViewProps) => {
  return (
    <View {...rest} style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: GeneralConstants.BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.Gray[1],
    padding: GeneralConstants.Spacing.lg,
  },
});

export default Card;
