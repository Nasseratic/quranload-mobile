import Svg, { Path } from "react-native-svg";

export function CrossIcon({ width = 24, height = 24, color = "#fff" }) {
  return (
    <Svg viewBox="0 0 24 24" fill="none" width={width} height={height}>
      <Path
        d="M19 5L5 19M5 5l14 14"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
