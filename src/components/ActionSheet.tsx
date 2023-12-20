import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { Separator, Stack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Typography from "./Typography";

type ActionSheetParams = {
  options: { title: string; onPress: () => void }[];
};

export const actionSheet = {
  show: () => {},
} as {
  show: (params: ActionSheetParams) => void;
};

export const RootActionSheetContainer = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const [currentParams, setCurrentParams] = useState<ActionSheetParams | null>(null);

  actionSheet.show = (params: ActionSheetParams) => {
    setCurrentParams(params);
    bottomSheetModalRef.current?.present();
  };

  return (
    <BottomSheetModal
      animateOnMount
      backdropComponent={(props) => (
        <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
      )}
      ref={bottomSheetModalRef}
      enableDynamicSizing
      onDismiss={() => {
        setCurrentParams(null);
      }}
    >
      <BottomSheetView>
        <Stack px="$6" pb={bottom + 16}>
          {currentParams?.options.map((option, index) => (
            <Stack key={index}>
              <Stack
                pressStyle={{ opacity: 0.7 }}
                onPress={() => {
                  option.onPress();
                  bottomSheetModalRef.current?.close();
                }}
                py="$3"
              >
                <Typography type="Body" style={{ color: "black" }}>
                  {option.title}
                </Typography>
              </Stack>
              {index !== currentParams.options.length - 1 && <Separator />}
            </Stack>
          ))}
        </Stack>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
