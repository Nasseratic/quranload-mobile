import Typography from "components/Typography";
import { Colors } from "constants/Colors";
import { FunctionComponent } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

const TextButton: FunctionComponent<TouchableOpacityProps> = ({ children, disabled, ...rest }) => {
  return (
    <TouchableOpacity disabled={disabled} {...rest}>
      <Typography type="BodyHeavy" style={{ color: disabled ? Colors.Gray[1] : Colors.Success[1] }}>
        {children}
      </Typography>
    </TouchableOpacity>
  );
};

export default TextButton;
