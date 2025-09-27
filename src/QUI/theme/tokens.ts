import GeneralConstants from "constants/GeneralConstants";
import { Colors } from "constants/Colors";
import { createTokens } from "tamagui";

const { Spacing, BorderRadius } = GeneralConstants;

const color = {
  background: Colors.White[1],
  backgroundStrong: Colors.Primary[1],
  surface: Colors.White[1],
  surfaceMuted: Colors.Gray[5],
  surfaceStrong: Colors.Gray[4],
  surfaceInverse: Colors.Primary[1],
  border: Colors.Gray[1],
  borderMuted: Colors.Gray[3],
  focus: Colors.Primary[4],
  shadow: "rgba(11, 37, 64, 0.08)",
  shadowStrong: "rgba(11, 37, 64, 0.16)",
  text: Colors.Black[1],
  textMuted: Colors.Black[2],
  textSubtle: Colors.Black[3],
  textInverse: Colors.White[1],
  primary: Colors.Primary[3],
  primaryHover: Colors.Primary[4],
  primaryPress: Colors.Primary[2],
  accent: Colors.Accent[2],
  accentHover: Colors.Accent[1],
  success: Colors.Success[1],
  warning: Colors.Warning[1],
  danger: Colors.Error[1],
};

const space = {
  none: 0,
  xxs: Spacing.xxs,
  xs: Spacing.xs,
  sm: Spacing.sm,
  md: Spacing.md,
  lg: Spacing.lg,
  xl: Spacing.xl,
  xxl: Spacing.xxl,
  gutter: 40,
};

const radius = {
  none: 0,
  xs: BorderRadius.xs,
  sm: BorderRadius.sm,
  md: BorderRadius.md,
  lg: BorderRadius.lg,
  xl: BorderRadius.xl,
  full: BorderRadius.full,
};

const size = {
  xxs: 28,
  xs: 32,
  sm: 40,
  md: 48,
  lg: 56,
  xl: 64,
};

const zIndex = {
  base: 0,
  dropdown: 10,
  overlay: 20,
  modal: 30,
  toast: 40,
};

export const quiRawTokens = {
  color,
  space,
  radius,
  size,
  zIndex,
};

export const quiTokens = createTokens(quiRawTokens);

type TokenGroup = typeof quiTokens;

export type QuiTokens = TokenGroup;
