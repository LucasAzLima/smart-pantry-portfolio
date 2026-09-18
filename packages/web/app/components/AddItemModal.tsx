"use client";

import { Button, Input, Modal } from "@smart-pantry/ui";
import { useState, type FormEvent } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import type { MessageKey } from "@/i18n/messages";
import {
  type PantryCategory,
  type PantryItem,
  type PantryUnit,
  usePantryStore,
} from "@/store/usePantryStore";

const UNITS: readonly PantryUnit[] = ["units", "kg", "g", "l", "ml"];
const CATEGORIES: readonly PantryCategory[] = ["pantry", "fridge", "freezer"];

const UNIT_MESSAGE_KEYS: Record<PantryUnit, MessageKey> = {
  units: "unit.units",
  kg: "unit.kg",
  g: "unit.g",
  l: "unit.l",
  ml: "unit.ml",
};

const CATEGORY_MESSAGE_KEYS: Record<PantryCategory, MessageKey> = {
  pantry: "category.pantry",
  fridge: "category.fridge",
  freezer: "category.freezer",
};

const selectClassName =
  "h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export interface AddItemModalProps {
  open: boolean;
  item?: PantryItem | null;
  onClose: () => void;
}

function getInitialFormValues(item: PantryItem | null) {
  return {
    name: item?.name ?? "",
    quantity: item ? String(item.quantity) : "1",
    unit: item?.unit ?? "units",
    category: item?.category ?? "pantry",
    expiryDate: item?.expiryDate ?? "",
  };
}

export function AddItemModal({
  open,
  item = null,
  onClose,
}: AddItemModalProps) {
  const { t } = useTranslation();
  const addItem = usePantryStore((state) => state.addItem);
  const updateItem = usePantryStore((state) => state.updateItem);
  const isMutating = usePantryStore((state) => state.isMutating);

  const initialValues = getInitialFormValues(item);
  const isEditing = item !== null;

  const [name, setName] = useState(initialValues.name);
  const [quantity, setQuantity] = useState(initialValues.quantity);
  const [unit, setUnit] = useState<PantryUnit>(initialValues.unit);
  const [category, setCategory] = useState<PantryCategory>(
    initialValues.category,
  );
  const [expiryDate, setExpiryDate] = useState(initialValues.expiryDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    const nextValues = getInitialFormValues(item);
    setName(nextValues.name);
    setQuantity(nextValues.quantity);
    setUnit(nextValues.unit);
    setCategory(nextValues.category);
    setExpiryDate(nextValues.expiryDate);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) {
      return;
    }

    const parsedQuantity = Number(quantity);
    const payload = {
      name: trimmedName,
      quantity: Number.isFinite(parsedQuantity) ? parsedQuantity : undefined,
      unit,
      category,
      expiryDate,
    };

    setIsSubmitting(true);

    const succeeded = item
      ? await updateItem(item.id, payload)
      : await addItem(payload);

    setIsSubmitting(false);

    if (!succeeded) {
      return;
    }

    resetForm();
    onClose();
  };

  const busy = isSubmitting || isMutating;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t(isEditing ? "modal.editItemTitle" : "modal.addItemTitle")}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={busy}
          >
            {t("modal.cancel")}
          </Button>
          <Button type="submit" form="add-item-form" isLoading={busy}>
            {t(isEditing ? "form.saveItem" : "form.addItem")}
          </Button>
        </>
      }
    >
      <form
        id="add-item-form"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="flex flex-col gap-4"
        aria-label={t(isEditing ? "form.editAriaLabel" : "form.ariaLabel")}
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="item-name"
            className="text-sm font-medium text-zinc-700"
          >
            {t("form.name")}
          </label>
          <Input
            id="item-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("form.namePlaceholder")}
            required
            autoComplete="off"
            disabled={busy}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <label
              htmlFor="item-quantity"
              className="text-sm font-medium text-zinc-700"
            >
              {t("form.quantity")}
            </label>
            <Input
              id="item-quantity"
              type="number"
              min={0.01}
              step="any"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="1"
              required
              disabled={busy}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <label
              htmlFor="item-unit"
              className="text-sm font-medium text-zinc-700"
            >
              {t("form.unit")}
            </label>
            <select
              id="item-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value as PantryUnit)}
              className={selectClassName}
              disabled={busy}
            >
              {UNITS.map((option) => (
                <option key={option} value={option}>
                  {t(UNIT_MESSAGE_KEYS[option])}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
            <label
              htmlFor="item-category"
              className="text-sm font-medium text-zinc-700"
            >
              {t("form.category")}
            </label>
            <select
              id="item-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as PantryCategory)
              }
              className={selectClassName}
              disabled={busy}
            >
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {t(CATEGORY_MESSAGE_KEYS[option])}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <label
            htmlFor="item-expiry"
            className="text-sm font-medium text-zinc-700"
          >
            {t("form.expiry")}
          </label>
          <Input
            id="item-expiry"
            type="date"
            value={expiryDate}
            onChange={(event) => setExpiryDate(event.target.value)}
            disabled={busy}
          />
        </div>
      </form>
    </Modal>
  );
}
