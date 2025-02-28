import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { IS_IOS } from "constants/GeneralConstants";
import { useEffect, useRef, useState } from "react";
import { Pressable } from "react-native";
import { Input, Stack } from "tamagui";
import ActionButton from "./buttons/ActionBtn";
import CommunityDatePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t, i18n } from "locales/config";
import { intlFormat } from "utils/formatTime";

export const DatePickerInput = ({
  value,
  onChange,
  placeholder,
  minDate,
}: Omit<DatePickerProps, "isOpen"> & {
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <DatePicker
        value={value ?? new Date()}
        onChange={(v) => {
          setShow(false);
          onChange(v);
        }}
        isOpen={show}
        minDate={minDate}
      />
      <Pressable
        onTouchStart={() => {
          setShow(true);
        }}
      >
        <Input
          borderWidth={0}
          placeholder={placeholder}
          value={value ? intlFormat(value, "date") : ""}
          editable={false}
        />
      </Pressable>
    </>
  );
};

type DatePickerProps = {
  value?: Date;
  onChange: (v: Date) => void;
  minDate?: Date;
  isOpen: boolean;
};

export const DatePicker = ({
  value,
  onChange,
  isOpen,
  minDate,
}: {
  onChange: (v: Date) => void;
  value: Date;
  isOpen: boolean;
  minDate?: Date;
}) => {
  const { bottom } = useSafeAreaInsets();
  const iosCurrentDate = useRef(new Date());
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
    }
  }, [isOpen]);

  return IS_IOS ? (
    <BottomSheetModal
      animateOnMount
      backdropComponent={(props) => (
        <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
      )}
      ref={bottomSheetModalRef}
      enableDynamicSizing
      onDismiss={() => {
        onChange(value);
      }}
    >
      <BottomSheetView
        style={{
          height: 250 + bottom,
        }}
      >
        <CommunityDatePicker
          value={value}
          mode="date"
          locale={i18n.locale}
          display="spinner"
          minimumDate={minDate}
          onChange={(v) => {
            iosCurrentDate.current = new Date(v.nativeEvent.timestamp ?? 0);
          }}
        />
        <Stack px="$4">
          <ActionButton
            textStyle={{
              fontSize: 14,
            }}
            title={t("done")}
            onPress={() => onChange(iosCurrentDate.current)}
          />
        </Stack>
      </BottomSheetView>
    </BottomSheetModal>
  ) : (
    isOpen && (
      <CommunityDatePicker
        locale={i18n.locale}
        value={value}
        minimumDate={minDate}
        mode="date"
        onChange={(v) => onChange(new Date(v.nativeEvent.timestamp ?? 0))}
      />
    )
  );
};
