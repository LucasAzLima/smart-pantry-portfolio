"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/i18n/useTranslation";

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <a
            href="#dashboard"
            className="truncate text-lg font-semibold tracking-tight text-zinc-900"
          >
            {t("app.title")}
          </a>
          <nav
            className="hidden items-center gap-1 sm:flex"
            aria-label={t("nav.ariaLabel")}
          >
            <a
              href="#inventory"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {t("nav.inventory")}
            </a>
          </nav>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
