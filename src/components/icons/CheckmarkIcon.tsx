import Svg, { Path } from "react-native-svg";

export function Checkmark({ width = 17, height = 13, color = "#fff" }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 13" fill="none">
      <Path
        d="M15.417.542l-9.834 9.833-4-4L.417 7.583l5.166 5.125 11-11L15.417.542z"
        fill={color}
      />
    </Svg>
  );
}
