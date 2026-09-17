import enUS from "./locales/en-US.json";
import ptBR from "./locales/pt-BR.json";

export const LOCALES = ["en-US", "pt-BR"] as const;

export type Locale = (typeof LOCALES)[number];

export type MessageKey = keyof typeof enUS;

export type Messages = Record<MessageKey, string>;

export const DEFAULT_LOCALE: Locale = "en-US";

export const LOCALE_STORAGE_KEY = "smart-pantry-locale";

export const dictionaries: Record<Locale, Messages> = {
  "en-US": enUS,
  "pt-BR": ptBR as Messages,
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
