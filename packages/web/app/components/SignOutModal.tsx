"use client";

import { Button, Modal } from "@smart-pantry/ui";
import { useTranslation } from "@/i18n/useTranslation";

export interface SignOutModalProps {
  open: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SignOutModal({
  open,
  isLoading = false,
  onCancel,
  onConfirm,
}: SignOutModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={t("modal.signOutTitle")}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("modal.cancel")}
          </Button>
          <Button type="button" onClick={onConfirm} isLoading={isLoading}>
            {t("modal.signOutConfirm")}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-zinc-600">
        {t("modal.signOutMessage")}
      </p>
    </Modal>
  );
}
