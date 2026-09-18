"use client";

import { Button, Modal } from "@smart-pantry/ui";
import { useTranslation } from "@/i18n/useTranslation";

export interface DeleteAccountModalProps {
  open: boolean;
  isLoading?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({
  open,
  isLoading = false,
  error = null,
  onCancel,
  onConfirm,
}: DeleteAccountModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={t("modal.deleteAccountTitle")}
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
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {t("modal.deleteAccountConfirm")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-zinc-600">
          {t("modal.deleteAccountMessage")}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
