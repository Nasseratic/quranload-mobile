import Svg, { Path } from "react-native-svg";

export function OptionsIcon({ size = 24, color = "#C2C9D1" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7 12a2 2 0 11-4 0 2 2 0 014 0zM14 12a2 2 0 11-4 0 2 2 0 014 0zM21 12a2 2 0 11-4 0 2 2 0 014 0z"
        fill={color}
      />
    </Svg>
  );
}
