import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { Separator, Stack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Typography from "./Typography";
import { t } from "locales/config";
import { Colors } from "constants/Colors";

type ActionSheetParams = {
  showCancelButton?: boolean;
  options: Array<{ title: string; onPress: () => void; destructive?: boolean }>;
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

  const showCancelButton = currentParams?.showCancelButton ?? true;

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
      handleStyle={{
        backgroundColor: "white",
        marginHorizontal: 16,
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
      }}
      handleIndicatorStyle={{ backgroundColor: "grey" }}
      style={{ borderRadius: 16, overflow: "hidden" }}
      containerStyle={{ borderRadius: 16, overflow: "hidden" }}
      backgroundStyle={{
        backgroundColor: "transparent",
      }}
    >
      <BottomSheetView>
        <Stack
          bbrr={16}
          bblr={16}
          mx={16}
          pt="$3"
          transform={[{ translateY: -16 }]}
          mb={bottom + 16}
          backgroundColor="white"
        >
          {currentParams?.options.map((option, index) => (
            <Stack key={index}>
              <Stack
                pressStyle={{ opacity: 0.7 }}
                onPress={() => {
                  option.onPress();
                  bottomSheetModalRef.current?.close();
                }}
                py="$4"
                ai="center"
              >
                <Typography
                  type="SubHeader"
                  style={{ color: option.destructive ? Colors.Error[1] : "black" }}
                >
                  {option.title}
                </Typography>
              </Stack>
              {(index !== currentParams.options.length - 1 || showCancelButton) && <Separator />}
            </Stack>
          ))}
          {showCancelButton && (
            <Stack
              pressStyle={{ opacity: 0.7 }}
              onPress={() => bottomSheetModalRef.current?.close()}
              py="$4"
              ai="center"
            >
              <Typography type="SubHeaderLight">{t("cancel")}</Typography>
            </Stack>
          )}
        </Stack>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
