import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import danish from "locales/da";
import english from "locales/en";
import { setLocale } from "yup";

// Set the key-value pairs for the different languages you want to support.
const translations = {
  da: danish,
  en: english,
};

export const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
i18n.locale = Localization.locale;

// When a value is missing from a language it'll fall back to another language with the key present.
i18n.enableFallback = true;

type Prev = [never, 0, 1, 2, 3, 4];

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Leaves<T, D extends number = 4> = [D] extends [never]
  ? never
  : T extends object
  ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
  : "";

export const t = <T extends Leaves<typeof english>>(path: T): string => i18n.t(path);

setLocale({
  mixed: {
    required: t("form.required"),
    defined: t("form.required"),
  },
  string: {
    email: t("form.validEmail"),
  },
});
