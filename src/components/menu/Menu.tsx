import { FunctionComponent } from "react";
import { View, StyleSheet } from "react-native";
import MenuItem, { IMenuItemProps } from "./MenuItem";
import GeneralConstants from "constants/GeneralConstants";

interface Props {
  menuItems: IMenuItemProps[];
}

const Menu: FunctionComponent<Props> = ({ menuItems }) => {
  return (
    <View style={styles.container}>
      {menuItems.map((menuItem, index) => (
        <MenuItem key={`advanced-settings-${menuItem.text}`} {...menuItem} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: GeneralConstants.Spacing.xs,
  },
});

export default Menu;
