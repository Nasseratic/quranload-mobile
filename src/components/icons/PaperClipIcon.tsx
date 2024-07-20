import * as React from "react";
import Svg, { Path } from "react-native-svg";

export function PaperClipIcon({ size, color }: { size?: number; color?: string }) {
  return (
    <Svg width={size || "800px"} height={size || "800px"} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.25 9a6.75 6.75 0 0113.5 0v7a.75.75 0 01-1.5 0V9a5.25 5.25 0 10-10.5 0v8a3.25 3.25 0 006.5 0v-7a1.25 1.25 0 10-2.5 0v6a.75.75 0 01-1.5 0v-6a2.75 2.75 0 115.5 0v7a4.75 4.75 0 11-9.5 0V9z"
        fill="#030D45"
      />
    </Svg>
  );
}
