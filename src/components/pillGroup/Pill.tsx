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
  <TouchableOpacity
    style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
    activeOpacity={active ? 1 : 0.8}
    onPress={() => (!active ? onPress(option.value) : null)}
  >
    <Typography style={active ? styles.active : styles.inactive} type="CaptionHeavy">
      {option.label}
    </Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pill: {
    borderRadius: GeneralConstants.BorderRadius.lg,
    paddingVertical: GeneralConstants.Spacing.xs,
    paddingHorizontal: GeneralConstants.Spacing.lg,
  },
  pillActive: {
    backgroundColor: Colors.Primary[1],
  },
  pillInactive: {
    backgroundColor: Colors.Black[5],
  },
  active: {
    color: Colors.White[1],
  },
  inactive: {
    color: Colors.Primary[1],
  },
});

export default Pill;
