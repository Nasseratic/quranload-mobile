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
        // You'll want to fill these values in so you can use them
        // for now, fontSize="$4" will be 14px.
        // You can define different keys, but `tamagui`
        // standardizes on 1-15.
        4: 14,
      },
      lineHeight: {
        4: 16,
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
