import * as React from "react";
import Svg, { Rect } from "react-native-svg";

export function StopIcon({ color = "#fff", size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={7} y={7} width={10} height={10} rx={2} fill={color} />
    </Svg>
  );
}
