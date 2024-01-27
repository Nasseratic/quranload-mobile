import Svg, { Path } from "react-native-svg";

export function ForwardIcon({
  backward = false,
  color = "#C2C9D1",
  thin = false,
}: {
  backward?: boolean;
  color?: string;
  thin?: boolean;
}) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 16 14"
      fill="none"
      style={{ transform: backward ? [{ scaleX: -1 }] : undefined }}
    >
      <Path
        d="M14.832 1.665v4m0 0h-4m4 0L11.745 2.76a6 6 0 101.413 6.24"
        stroke={color}
        strokeWidth={thin ? 1.2 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
