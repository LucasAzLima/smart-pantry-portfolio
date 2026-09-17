"use client";

import { Button, Modal } from "@smart-pantry/ui";
import { useTranslation } from "@/i18n/useTranslation";

export interface RemoveItemModalProps {
  open: boolean;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RemoveItemModal({
  open,
  itemName,
  onCancel,
  onConfirm,
}: RemoveItemModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={t("modal.removeItemTitle")}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("modal.cancel")}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {t("modal.removeConfirm")}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-zinc-600">
        {t("modal.removeItemMessage", { name: itemName })}
      </p>
    </Modal>
  );
}
