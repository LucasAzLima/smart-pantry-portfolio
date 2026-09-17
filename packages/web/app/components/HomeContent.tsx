"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { PantryDemo } from "./PantryDemo";
import { useTranslation } from "@/i18n/useTranslation";

export function HomeContent() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t("app.title")}
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              {t("app.subtitle")}
            </p>
          </div>
          <LanguageSwitcher />
        </header>
        <PantryDemo />
      </main>
    </div>
  );
}
