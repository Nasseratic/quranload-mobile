import { ScrollView, View } from "tamagui";
import Pill from "./Pill";
import GeneralConstants from "constants/GeneralConstants";

interface PillGroupProps<T> {
  options: Frontend.Content.Option<T>[];
  selected: T;
  onChange: (value: T) => void;
}
const PillGroup = <T,>({ options, selected, onChange }: PillGroupProps<T>) => (
  <View pb={GeneralConstants.Spacing.md}>
    <ScrollView
      horizontal
      alwaysBounceVertical={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: GeneralConstants.Spacing.xxs,
        paddingHorizontal: GeneralConstants.Spacing.md,
      }}
    >
      {options.map((option) => (
        <Pill
          key={option.label}
          onPress={onChange}
          option={option}
          active={option.value === selected}
        />
      ))}
    </ScrollView>
  </View>
);

export default PillGroup;
