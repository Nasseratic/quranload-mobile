import { shorthands } from "@tamagui/shorthands";
import { themes, tokens } from "@tamagui/themes";
import { createFont, createTamagui } from "tamagui";

export const tamaguiConfig = createTamagui({
  themes,
  tokens,
  shorthands,
  fonts: {
    body: createFont({
      size: {
        true: 16,
      },
      lineHeight: {
        true: 16,
      },
    }),
  },
});

export type TamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // or '@tamagui/core'
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
