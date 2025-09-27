import { config } from "@tamagui/config/v3";
import { createTamagui, createTokens } from "tamagui";
import { quiFonts, quiRawTokens, quiThemes, QUI_THEME_NAMES } from "./src/QUI";

const tokens = createTokens({
  color: {
    ...config.tokens.color,
    ...quiRawTokens.color,
  },
  radius: {
    ...config.tokens.radius,
    ...quiRawTokens.radius,
  },
  size: {
    ...config.tokens.size,
    ...quiRawTokens.size,
  },
  space: {
    ...config.tokens.space,
    ...quiRawTokens.space,
  },
  zIndex: {
    ...config.tokens.zIndex,
    ...quiRawTokens.zIndex,
  },
});

export const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    ...config.fonts,
    ...quiFonts,
  },
  tokens,
  themes: {
    ...config.themes,
    [QUI_THEME_NAMES.light]: quiThemes.light,
    [QUI_THEME_NAMES.dark]: quiThemes.dark,
  },
});

export type TamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // or '@tamagui/core'
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
