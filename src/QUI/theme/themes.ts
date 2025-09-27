import { config } from "@tamagui/config/v3";
import { Colors } from "constants/Colors";
import { createTheme } from "tamagui";

const baseLight = config.themes.light;
const baseDark = config.themes.dark;

export const QUI_THEME_NAMES = {
  light: "qui_light",
  dark: "qui_dark",
} as const;

const shared = {
  borderColor: "$border",
  borderColorHover: "$borderMuted",
  borderColorPress: "$borderMuted",
  colorFocus: "$focus",
  colorPress: "$primaryPress",
  colorHover: "$primaryHover",
  color: "$text",
  shadowColor: "$shadow",
  shadowColorHover: "$shadowStrong",
  shadowColorPress: "$shadowStrong",
  backgroundFocus: "$surfaceStrong",
  backgroundPress: "$surfaceStrong",
  backgroundHover: "$surfaceMuted",
};

export const quiThemes = {
  light: createTheme({
    ...baseLight,
    ...shared,
    background: "$surface",
    backgroundStrong: "$surfaceStrong",
    backgroundTransparent: "transparent",
    color: Colors.Black[1],
    color2: Colors.Black[2],
    color3: Colors.Black[3],
    color10: Colors.Primary[3],
    color11: Colors.Success[1],
    color12: Colors.Black[1],
    accentBackground: "$accent",
    accentColor: Colors.Accent[1],
    surface: "$surface",
    surfaceHover: "$surfaceMuted",
    surfacePress: "$surfaceStrong",
    primary: "$primary",
    success: "$success",
    warning: "$warning",
    danger: "$danger",
  }),
  dark: createTheme({
    ...baseDark,
    ...shared,
    background: Colors.Primary[1],
    backgroundStrong: Colors.Primary[2],
    color: Colors.White[1],
    color2: Colors.White[2],
    color3: Colors.White[3],
    color10: Colors.Primary[5],
    color11: Colors.Success[3],
    color12: Colors.White[1],
    accentBackground: Colors.Accent[1],
    accentColor: Colors.Accent[4],
    surface: "$surfaceInverse",
    surfaceHover: "$primaryHover",
    surfacePress: "$primaryPress",
    primary: Colors.Primary[4],
    success: Colors.Success[2],
    warning: Colors.Warning[2],
    danger: Colors.Error[2],
  }),
};

export const quiThemesById = {
  [QUI_THEME_NAMES.light]: quiThemes.light,
  [QUI_THEME_NAMES.dark]: quiThemes.dark,
} as const;

export type QuiThemeName = keyof typeof QUI_THEME_NAMES;
export type QuiThemeIdentifier = keyof typeof quiThemesById;
