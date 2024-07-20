import { ChevronLeftIcon } from "assets/icons";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Typography from "./Typography";
import { useNavigation } from "@react-navigation/native";

export const APPBAR_HEIGHT = 56;

export type AppBarProps = {
  title: string;
  disableGoBack?: boolean;
  rightComponent?: React.ReactNode;
};

export const AppBar = ({ title, disableGoBack, rightComponent }: AppBarProps) => {
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
      paddingRight: GeneralConstants.Spacing.xs,
      paddingLeft: !canGoBack ? GeneralConstants.Spacing.md : 0,
    },
    goBackButton: {
      paddingVertical: GeneralConstants.Spacing.md,
      paddingRight: GeneralConstants.Spacing.md,
      paddingLeft: canGoBack ? GeneralConstants.Spacing.md : 0,
    },
    title: {
      flex: 1,
      flexGrow: 1,
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
      <Typography style={styles.title} numberOfLines={1} ellipsizeMode="tail" type="HeadlineHeavy">
        {title}
      </Typography>
      {rightComponent}
    </View>
  );
};
