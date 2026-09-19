"use client";

import { AppHeader } from "@/app/components/AppHeader";
import { FloatingLanguageSelector } from "@/app/components/FloatingLanguageSelector";
import { GuestModeGate } from "@/app/components/GuestModeGate";
import { PantryDemo } from "@/app/components/PantryDemo";
import { useTranslation } from "@/i18n/useTranslation";

export interface HomeContentProps {
  userEmail: string | null;
  userName?: string | null;
}

export function HomeContent({
  userEmail,
  userName = null,
}: HomeContentProps) {
  const { t } = useTranslation();
  const isAuthenticated = userEmail !== null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f4f6f8] font-sans text-zinc-900">
      <AppHeader
        userEmail={userEmail}
        userName={userName}
        isGuest={!isAuthenticated}
      />
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
        <GuestModeGate isAuthenticated={isAuthenticated} />
        <PantryDemo />
      </main>
      <FloatingLanguageSelector />
    </div>
  );
}
