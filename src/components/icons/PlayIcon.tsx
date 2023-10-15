import Svg, { Path } from "react-native-svg";

export function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.875977 3.00793C0.875977 0.987582 3.04206 -0.29316 4.81232 0.680485L21.1615 9.67252C22.9964 10.6817 22.9963 13.3182 21.1615 14.3274L4.81232 23.3195C3.04206 24.2931 0.875977 23.0124 0.875977 20.992V3.00793Z"
        fill="#C2C9D1"
      />
    </Svg>
  );
}
