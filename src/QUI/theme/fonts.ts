import { createFont } from "tamagui";

const size = {
  1: 10,
  2: 12,
  3: 14,
  4: 16,
  5: 18,
  6: 20,
  7: 24,
  8: 32,
  9: 36,
  10: 44,
};

const lineHeight = {
  1: 14,
  2: 16,
  3: 18,
  4: 22,
  5: 24,
  6: 28,
  7: 32,
  8: 40,
  9: 48,
  10: 56,
};

const letterSpacing = {
  1: 0,
  2: 0,
  3: 0,
  4: -0.1,
  5: -0.2,
  6: -0.2,
  7: -0.4,
  8: -0.6,
  9: -0.8,
  10: -1,
};

const notoSansWeight = {
  1: "400",
  2: "500",
  3: "600",
  4: "700",
};

const notoSans = createFont({
  family: "NotoSans-regular",
  size,
  lineHeight,
  letterSpacing,
  weight: notoSansWeight,
});

const notoSansHeading = createFont({
  family: "NotoSans-bold",
  size,
  lineHeight,
  letterSpacing,
  weight: notoSansWeight,
});

const notoSansSemibold = createFont({
  family: "NotoSans-semibold",
  size,
  lineHeight,
  letterSpacing,
  weight: notoSansWeight,
});

export const quiFonts = {
  heading: notoSansHeading,
  body: notoSans,
  mono: createFont({
    family: "Inter",
    size,
    lineHeight,
    letterSpacing,
    weight: {
      1: "400",
      2: "500",
      3: "600",
      4: "700",
    },
  }),
  button: notoSansSemibold,
};

export type QuiFonts = typeof quiFonts;
