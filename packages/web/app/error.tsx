"use client";

import { Button } from "@smart-pantry/ui";
import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[#f4f6f8] px-4 py-16 font-sans text-zinc-900">
      <div className="flex w-full max-w-md flex-col gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {t("error.heading")}
          </h1>
          <p className="text-sm text-zinc-600">{t("error.message")}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={reset}>
            {t("error.tryAgain")}
          </Button>
          <Link href="/">
            <Button type="button" variant="outline" className="w-full">
              {t("error.goHome")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
