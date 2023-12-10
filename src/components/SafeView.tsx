import { PropsWithChildren } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";

export const SafeView = ({ children }: PropsWithChildren) => {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View pt={top} pb={bottom + 16}>
      {children}
    </View>
  );
};
