import { useEffect } from "react";
import { AppState } from "react-native";
import { match } from "ts-pattern";

export const useAppStatusEffect = ({
  onForeground,
  onBackground,
}: {
  onForeground?: VoidFunction;
  onBackground?: VoidFunction;
}) => {
  useEffect(() => {
    let isActive = true;
    const subscription = AppState.addEventListener("change", (appState) => {
      match(appState)
        .with("active", () => {
          if (isActive) return;
          isActive = true;
          onForeground?.();
        })
        .otherwise(() => {
          if (!isActive) return;
          isActive = false;
          onBackground?.();
        });
    });

    return () => {
      subscription.remove();
    };
  }, []);
};
