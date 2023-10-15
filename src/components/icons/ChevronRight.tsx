import { Path, Svg } from "react-native-svg";

const ChevronRight = ({ color = "#fff" }) => {
  return (
    <Svg width="15" height="16" viewBox="0 0 15 16" fill="none">
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
