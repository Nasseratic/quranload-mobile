import { useState } from "react";
import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { Circle } from "tamagui";
import { TouchableOpacity } from "react-native";
interface Props {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  letter: string;
}
const LetterCheckbox = ({ checked, onChange, letter }: Props) => {
  const [isChecked, setIsChecked] = useState(checked ?? false);
  const handleOnChange = () => {
    setIsChecked(!isChecked);
    onChange?.(isChecked);
  };
  return (
    <TouchableOpacity onPress={handleOnChange}>
      <Circle bw={2} size="$3" borderColor={isChecked ? Colors.Success[1] : Colors.Black[3]}>
        <Typography
          type="SubHeaderHeavy"
          style={{ color: isChecked ? Colors.Primary[1] : Colors.Black[3] }}
        >
          {letter}
        </Typography>
      </Circle>
    </TouchableOpacity>
  );
};

export default LetterCheckbox;
