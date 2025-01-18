import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

export const tamaguiConfig = createTamagui(config);

export type TamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // or '@tamagui/core'
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
