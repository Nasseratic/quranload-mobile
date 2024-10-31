import { ScrollView, View } from "tamagui";
import { Tab, TabOption } from "./Tab";
import GeneralConstants from "constants/GeneralConstants";

interface TabGroupProps<T> {
  options: TabOption<T>[];
  selected: T;
  onChange: (value: T) => void;
}
export const TabGroup = <T,>({ options, selected, onChange }: TabGroupProps<T>) => (
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
        <Tab
          key={option.label}
          onPress={onChange}
          option={option}
          active={option.value === selected}
        />
      ))}
    </ScrollView>
  </View>
);
