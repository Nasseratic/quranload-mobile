import { PropsWithChildren } from "react";
import { TamaguiProvider, Theme } from "tamagui";
import { tamaguiConfig } from "../../../tamagui.config";
import { QUI_THEME_NAMES, QuiThemeIdentifier } from "../theme";

type QUIProviderProps = PropsWithChildren<{
  defaultTheme?: QuiThemeIdentifier;
  disableCSSInjection?: boolean;
  disableRootThemeClass?: boolean;
}>;

export const QUIProvider = ({
  children,
  defaultTheme = QUI_THEME_NAMES.light,
  disableCSSInjection,
  disableRootThemeClass,
}: QUIProviderProps) => {
  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={defaultTheme}
      disableInjectCSS={disableCSSInjection}
      disableRootThemeClass={disableRootThemeClass}
    >
      <Theme name={defaultTheme}>{children}</Theme>
    </TamaguiProvider>
  );
};

export default QUIProvider;
