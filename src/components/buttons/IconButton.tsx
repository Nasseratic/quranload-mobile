import { StyleSheet, TouchableOpacity } from "react-native";

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
} as const;

export const IconButton = ({
  bg = "#fff",
  icon,
  onPress,
  size = "md",
}: {
  icon: JSX.Element;
  onPress: () => void;
  bg?: string;
  size?: "sm" | "md" | "lg";
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.frame,
        {
          backgroundColor: bg,
          width: sizeMap[size ?? "md"],
          height: sizeMap[size ?? "md"],
          borderRadius: sizeMap[size ?? "md"],
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
    justifyContent: "center",
    alignItems: "center",
  },
});
