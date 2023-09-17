import { FunctionComponent } from "react";
import { ChevronRightIcon } from "assets/icons";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { TouchableOpacity, StyleSheet } from "react-native";

export interface IMenuItemProps {
  text: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: JSX.Element;
}

const MenuItem: FunctionComponent<IMenuItemProps> = ({ text, onPress, disabled, icon }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.container]}>
      {icon && icon}
      <Typography type="CaptionHeavy" style={styles.text}>
        {text}
      </Typography>
      <ChevronRightIcon style={{ marginLeft: "auto" }} color={Colors.Primary[1]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: GeneralConstants.Spacing.sm,
    paddingHorizontal: GeneralConstants.Spacing.md,
    paddingVertical: GeneralConstants.Spacing.sm,
    backgroundColor: Colors.White[1],
    borderColor: Colors.Black[4],
    borderWidth: 2,
    borderRadius: GeneralConstants.BorderRadius.xs,
  },
  text: {
    color: Colors.Primary[1],
  },
  icon: {
    color: Colors.Primary[1],
  },
});

export default MenuItem;
