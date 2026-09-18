"use client";

import Link from "next/link";
import { Button } from "@smart-pantry/ui";
import { useTranslation } from "@/i18n/useTranslation";

export function GuestModeBanner() {
  const { t } = useTranslation();

  return (
    <aside
      className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm font-semibold tracking-tight">
          {t("guest.badge")}
        </p>
        <p className="text-sm text-sky-900/90">{t("guest.bannerMessage")}</p>
      </div>
      <div className="shrink-0">
        <Link href="/login">
          <Button type="button" size="sm">
            {t("guest.createAccount")}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
