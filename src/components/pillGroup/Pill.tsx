import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, TouchableOpacity } from "react-native";

interface PillProps<T> {
  option: Frontend.Content.Option<T>;
  active: boolean;
  onPress: (value: T) => void;
}

const Pill = <T,>({ onPress, option, active }: PillProps<T>) => (
  <TouchableOpacity style={styles.pill} activeOpacity={0.9} onPress={() => onPress(option.value)}>
    <Typography style={active ? styles.active : styles.inactive} type="CaptionHeavy">
      {option.label}
    </Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pill: {
    backgroundColor: Colors.Primary[1],
    borderRadius: GeneralConstants.BorderRadius.lg,
    paddingVertical: GeneralConstants.Spacing.xs,
    paddingHorizontal: GeneralConstants.Spacing.lg,
  },
  active: {
    color: Colors.White[1],
  },
  inactive: {
    color: Colors.White[3],
  },
});

export default Pill;
