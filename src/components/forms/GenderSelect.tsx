import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import GeneralConstants from "constants/GeneralConstants";
import { t } from "locales/config";
import { Text, ToggleGroup, YStack } from "tamagui";

const options = [t("registerAccountScreen.gender.male"), t("registerAccountScreen.gender.female")];

interface GenderSelectProps {
  selected: number | null;
  touched?: boolean;
  error?: string;
  onChange: (newValue: string) => void;
}

export const GenderSelect = ({ error, selected, touched, onChange }: GenderSelectProps) => {
  return (
    <YStack gap={GeneralConstants.Spacing.xxs}>
      <Typography type="BodyHeavy">{t("registerAccountScreen.gender.label")}</Typography>
      <ToggleGroup type="single" value={selected?.toString()} onValueChange={onChange}>
        {options.map((option, index) => (
          <ToggleGroup.Item
            key={option}
            value={index.toString()}
            flex={1}
            borderWidth={2}
            borderColor={
              error && touched
                ? Colors.Error[1]
                : index === selected
                ? Colors.Primary[1]
                : Colors.Black[4]
            }
            backgroundColor={index === selected ? Colors.Primary[1] : Colors.White[1]}
          >
            <Text color={index === selected ? Colors.White[1] : Colors.Black[2]}>{option}</Text>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
      {error && touched && (
        <Typography type="BodyLight" style={{ color: Colors.Error[1] }}>
          {error}
        </Typography>
      )}
    </YStack>
  );
};
