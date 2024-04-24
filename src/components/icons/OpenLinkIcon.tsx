import * as React from "react";
import Svg, { Line, Path, Polyline } from "react-native-svg";

export function OpenLinkIcon({ size = 20, color = "#000" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" strokeWidth="4" stroke={color} fill="none">
      <Path d="M55.4,32V53.58a1.81,1.81,0,0,1-1.82,1.82H10.42A1.81,1.81,0,0,1,8.6,53.58V10.42A1.81,1.81,0,0,1,10.42,8.6H32" />
      <Polyline points="40.32 8.6 55.4 8.6 55.4 24.18" />
      <Line x1="19.32" y1="45.72" x2="54.61" y2="8.91" />
    </Svg>
  );
}
