"use client";

import { Button } from "@smart-pantry/ui";
import { useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root layout fallback. Must render its own html/body because the root
 * layout is replaced when this boundary activates.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body className="flex min-h-full flex-col bg-[#f4f6f8] font-sans text-zinc-900 antialiased">
        <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="flex w-full max-w-md flex-col gap-6 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {t("error.heading")}
              </h1>
              <p className="text-sm text-zinc-600">{t("error.message")}</p>
            </div>
            <div className="flex justify-center">
              <Button type="button" onClick={reset}>
                {t("error.tryAgain")}
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
