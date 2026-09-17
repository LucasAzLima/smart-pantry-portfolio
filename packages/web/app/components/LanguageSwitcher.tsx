"use client";

import { Button } from "@smart-pantry/ui";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import type { Locale } from "@/i18n/messages";

const LOCALE_OPTIONS: ReadonlyArray<{ locale: Locale; labelKey: "language.en" | "language.pt" }> =
  [
    { locale: "en-US", labelKey: "language.en" },
    { locale: "pt-BR", labelKey: "language.pt" },
  ];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1"
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
