import * as React from "react";
import Svg, { Path } from "react-native-svg";

export function SendIcon({ size, color }: { size?: number; color?: string }) {
  return (
    <Svg width={size || "800px"} height={size || "800px"} viewBox="0 -0.5 25 25" fill="none">
      <Path
        clipRule="evenodd"
        d="M18.455 9.883L7.063 4.143a1.048 1.048 0 00-1.563.733.82.82 0 00.08.326l2.169 5.24c.109.348.168.71.176 1.074a3.875 3.875 0 01-.176 1.074L5.58 17.83a.82.82 0 00-.08.326 1.048 1.048 0 001.562.732l11.393-5.74a1.8 1.8 0 000-3.265v0z"
        stroke={color || "#030D45"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
