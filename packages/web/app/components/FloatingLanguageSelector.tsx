"use client";

import { Button } from "@smart-pantry/ui";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import type { Locale } from "@/i18n/messages";

const LOCALE_OPTIONS: ReadonlyArray<{
  locale: Locale;
  labelKey: "language.en" | "language.pt";
}> = [
  { locale: "en-US", labelKey: "language.en" },
  { locale: "pt-BR", labelKey: "language.pt" },
];

export function FloatingLanguageSelector() {
  const { locale, setLocale, t } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg transition-shadow duration-200 ease-out hover:shadow-xl"
      role="group"
      aria-label={t("language.label")}
    >
      {LOCALE_OPTIONS.map((option) => {
        const isSelected = locale === option.locale;
        return (
          <Button
            key={option.locale}
            type="button"
            size="sm"
            variant={isSelected ? "primary" : "ghost"}
            aria-pressed={isSelected}
            onClick={() => setLocale(option.locale)}
          >
            {t(option.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}
