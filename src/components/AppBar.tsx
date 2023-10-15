import { ChevronLeftIcon } from "assets/icons";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Typography from "./Typography";
import { useNavigation } from "@react-navigation/native";

const APPBAR_HEIGHT = 50;

type Props = Frontend.Content.AppBar;

const AppBar = ({ title, disableGoBack, action }: Props) => {
  const navigation = useNavigation();
  const canGoBack = useMemo(
    () => !disableGoBack && navigation.canGoBack(),
    [disableGoBack, navigation]
  );
  const styles = StyleSheet.create({
    appBar: {
      height: APPBAR_HEIGHT,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingRight: GeneralConstants.Spacing.md,
      paddingLeft: !canGoBack ? GeneralConstants.Spacing.md : 0,
    },
    goBackButton: {
      paddingVertical: GeneralConstants.Spacing.md,
      paddingRight: GeneralConstants.Spacing.md,
      paddingLeft: canGoBack ? GeneralConstants.Spacing.md : 0,
    },
    title: {
      color: Colors.Primary[1],
    },
  });

  return (
    <View style={styles.appBar}>
      {canGoBack && (
        <TouchableOpacity style={styles.goBackButton} onPress={navigation.goBack}>
          <ChevronLeftIcon color={Colors.Primary[1]} />
        </TouchableOpacity>
      )}
      <Typography style={styles.title} type="HeadlineHeavy">
        {title}
      </Typography>
      {action && (
        <TouchableOpacity onPress={action.onPress} style={{ marginLeft: "auto" }}>
          {action.icon}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AppBar;
