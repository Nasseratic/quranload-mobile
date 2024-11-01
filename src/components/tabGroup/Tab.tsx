import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { StyleSheet, TouchableOpacity } from "react-native";

export interface TabOption<T> {
  label: string;
  value: T;
}

interface TabProps<T> {
  option: TabOption<T>;
  active: boolean;
  onPress: (value: T) => void;
}

export const Tab = <T,>({ onPress, option, active }: TabProps<T>) => (
  <TouchableOpacity
    style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}
    activeOpacity={active ? 1 : 0.8}
    onPress={() => (!active ? onPress(option.value) : null)}
  >
    <Typography style={active ? styles.active : styles.inactive} type="CaptionHeavy">
      {option.label}
    </Typography>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tab: {
    borderRadius: GeneralConstants.BorderRadius.lg,
    paddingVertical: GeneralConstants.Spacing.xs,
    paddingHorizontal: GeneralConstants.Spacing.lg,
  },
  tabActive: {
    backgroundColor: Colors.Primary[1],
  },
  tabInactive: {
    backgroundColor: Colors.Black[5],
  },
  active: {
    color: Colors.White[1],
  },
  inactive: {
    color: Colors.Primary[1],
  },
});
