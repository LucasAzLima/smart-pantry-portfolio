"use client";

import { AppHeader } from "./AppHeader";
import { PantryDemo } from "./PantryDemo";
import { useTranslation } from "@/i18n/useTranslation";

export interface HomeContentProps {
  userEmail: string | null;
}

export function HomeContent({ userEmail }: HomeContentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f4f6f8] font-sans text-zinc-900">
      <AppHeader userEmail={userEmail} />
      <main
        id="dashboard"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {t("dashboard.heading")}
          </h1>
          <p className="max-w-2xl text-base text-zinc-600">
            {t("app.subtitle")}
          </p>
        </div>
        <PantryDemo />
      </main>
    </div>
  );
}
