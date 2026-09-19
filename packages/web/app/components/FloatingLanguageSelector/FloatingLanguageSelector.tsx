"use client";

import { Button } from "@smart-pantry/ui";
import { useEffect } from "react";
import { LOCALE_OPTIONS } from "./FloatingLanguageSelector.constants";
import { useTranslation } from "@/i18n/useTranslation";

function joinClasses(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div
      className={joinClasses(
        "inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1",
        className,
      )}
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

export function FloatingLanguageSelector() {
  return (
    <div className="fixed right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-40 hidden sm:block">
      <LanguageSelector className="shadow-lg transition-shadow duration-200 ease-out hover:shadow-xl" />
    </div>
  );
}
