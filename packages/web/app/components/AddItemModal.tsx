"use client";

import { Button, Input, Modal } from "@smart-pantry/ui";
import { useState, type FormEvent } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import type { MessageKey } from "@/i18n/messages";
import {
  type PantryCategory,
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
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddItemModal({ open, onClose }: AddItemModalProps) {
  const { t } = useTranslation();
  const addItem = usePantryStore((state) => state.addItem);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<PantryUnit>("units");
  const [category, setCategory] = useState<PantryCategory>("pantry");
  const [expiryDate, setExpiryDate] = useState("");

  const resetForm = () => {
    setName("");
    setQuantity("1");
    setUnit("units");
    setCategory("pantry");
    setExpiryDate("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const parsedQuantity = Number(quantity);

    addItem({
      name: trimmedName,
      quantity: Number.isFinite(parsedQuantity) ? parsedQuantity : undefined,
      unit,
      category,
      expiryDate,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("modal.addItemTitle")}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t("modal.cancel")}
          </Button>
          <Button type="submit" form="add-item-form">
            {t("form.addItem")}
          </Button>
        </>
      }
    >
      <form
        id="add-item-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        aria-label={t("form.ariaLabel")}
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
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
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
            />
          </div>

          <div className="flex flex-col gap-2">
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
            >
              {UNITS.map((option) => (
                <option key={option} value={option}>
                  {t(UNIT_MESSAGE_KEYS[option])}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
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
            >
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {t(CATEGORY_MESSAGE_KEYS[option])}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
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
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
