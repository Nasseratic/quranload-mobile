import { Dimensions } from "react-native";
export default {
  Spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  BorderRadius: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    full: 100,
  },
};

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
