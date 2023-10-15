import { useEffect } from "react";
import { AppState } from "react-native";
import { match } from "ts-pattern";

export const useAppStatusEffect = (fn: VoidFunction) => {
  useEffect(() => {
    let isActive = true;
    const subscription = AppState.addEventListener("change", (appState) => {
      match(appState)
        .with("active", () => {
          if (isActive) return;
          isActive = true;
          fn();
        })
        .otherwise(() => {
          if (!isActive) return;
          isActive = false;
        });
    });

    return () => {
      subscription.remove();
    };
  }, []);
};
