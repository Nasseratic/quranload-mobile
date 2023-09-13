import { StyleSheet, TouchableOpacity } from "react-native";

export const IconButton = ({
  bg = "#fff",
  icon,
  onPress,
}: {
  icon: JSX.Element;
  onPress: () => void;
  bg?: string;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.frame,
        {
          backgroundColor: bg,
        },
      ]}
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  frame: {
    padding: 16,
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
