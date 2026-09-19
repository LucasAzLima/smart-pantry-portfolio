"use client";

import { Button } from "@smart-pantry/ui";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[#f4f6f8] px-4 py-16 font-sans text-zinc-900">
      <div className="flex w-full max-w-md flex-col gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {t("notFound.heading")}
          </h1>
          <p className="text-sm text-zinc-600">{t("notFound.message")}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button type="button" className="w-full">
              {t("notFound.goHome")}
            </Button>
          </Link>
          <Link href="/login">
            <Button type="button" variant="outline" className="w-full">
              {t("notFound.goLogin")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
