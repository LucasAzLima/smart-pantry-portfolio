"use client";

import Link from "next/link";
import { LanguageSelector } from "./FloatingLanguageSelector";
import { UserProfileMenu } from "./UserProfileMenu";
import { useTranslation } from "@/i18n/useTranslation";

export interface AppHeaderProps {
  userEmail: string | null;
  userName?: string | null;
  isGuest?: boolean;
}

export function AppHeader({
  userEmail,
  userName = null,
  isGuest = false,
}: AppHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="truncate text-lg font-semibold tracking-tight text-zinc-900"
          >
            {t("app.title")}
          </Link>
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
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSelector className="sm:hidden" />
          {userEmail ? (
            <UserProfileMenu userName={userName} userEmail={userEmail} />
          ) : (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {isGuest ? (
                <span
                  className="truncate text-sm text-zinc-600"
                  aria-label={t("guest.badge")}
                >
                  {t("guest.badge")}
                </span>
              ) : null}
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                {t("auth.signIn")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
