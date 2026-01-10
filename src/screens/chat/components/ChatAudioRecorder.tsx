import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { Button, Separator, Stack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Recorder, RecordingState } from "components/Recorder";

export const ChatAudioRecorder = ({
  isOpen,
  onClose,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSend: (params: { uri: string }) => Promise<void>;
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");

  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <BottomSheetModal
      animateOnMount
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          {...props}
          pressBehavior={recordingState === "idle" ? "close" : "none"}
        />
      )}
      ref={bottomSheetModalRef}
      enableDynamicSizing
      onDismiss={onClose}
      handleStyle={{
        backgroundColor: "white",
        marginHorizontal: 16,
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
      }}
      handleIndicatorStyle={{ backgroundColor: recordingState === "idle" ? "gray" : "white" }}
      enableHandlePanningGesture={recordingState === "idle"}
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
          m={16}
          mb={bottom + 16}
          py={16}
          pb={32}
          transform={[{ translateY: -16 }]}
          backgroundColor="white"
          gap="$4"
        >
          {/* TODO: Rebuild ChatAudioRecorder from scratch */}
          {/* {isOpen ? <Recorder onSubmit={onSend} onStatusChange={setRecordingState} /> : null} */}
          {isOpen ? <Recorder onStatusChange={setRecordingState} /> : null}
        </Stack>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
