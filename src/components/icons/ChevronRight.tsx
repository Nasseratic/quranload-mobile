import { Path, Svg } from "react-native-svg";

const ChevronRight = ({ color = "#fff", size = 16 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 16" fill="none">
      <Path
        d="M5.3125 3.625L9.6875 8L5.3125 12.375"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronRight;
