"use client";

import { Button } from "@smart-pantry/ui";
import { useState, useTransition } from "react";
import { SignOutModal } from "./SignOutModal";
import { signOut } from "@/app/actions/auth";
import { isNextRedirectError } from "@/lib/auth/redirect";
import { useTranslation } from "@/i18n/useTranslation";
import { usePantryStore } from "@/store/usePantryStore";

export function SignOutButton() {
  const { t } = useTranslation();
  const enterGuestSession = usePantryStore((state) => state.enterGuestSession);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (isPending) {
      return;
    }

    setIsConfirmOpen(false);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        enterGuestSession();
        await signOut();
      } catch (caught) {
        if (isNextRedirectError(caught)) {
          throw caught;
        }
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsConfirmOpen(true)}
      >
        {t("auth.signOut")}
      </Button>
      <SignOutModal
        open={isConfirmOpen}
        isLoading={isPending}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}
