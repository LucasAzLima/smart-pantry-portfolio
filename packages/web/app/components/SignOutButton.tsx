"use client";

import { Button } from "@smart-pantry/ui";
import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { isNextRedirectError } from "@/lib/auth/redirect";
import { useTranslation } from "@/i18n/useTranslation";

export function SignOutButton() {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      isLoading={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            await signOut();
          } catch (caught) {
            if (isNextRedirectError(caught)) {
              throw caught;
            }
          }
        });
      }}
    >
      {t("auth.signOut")}
    </Button>
  );
}
