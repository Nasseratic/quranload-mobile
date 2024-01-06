import { ComponentProps } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";

export const SafeView = ({
  side = "both",
  ...props
}: ComponentProps<typeof View> & {
  side?: "top" | "bottom" | "both";
}) => {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View
      pt={side === "top" || side === "both" ? top : 0}
      pb={side === "bottom" || side === "both" ? bottom : 0}
      {...props}
    />
  );
};
