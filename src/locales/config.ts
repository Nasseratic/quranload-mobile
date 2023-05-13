import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import danish from "locales/da";
import english from "locales/en";

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
