import type { Locale } from "@/i18n/messages";

export const LOCALE_OPTIONS: ReadonlyArray<{
  locale: Locale;
  labelKey: "language.en" | "language.pt";
}> = [
  { locale: "en-US", labelKey: "language.en" },
  { locale: "pt-BR", labelKey: "language.pt" },
];
