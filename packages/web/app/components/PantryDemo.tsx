"use client";

import { Badge, Button, Card, Input } from "@smart-pantry/ui";
import { useState, type FormEvent } from "react";
import {
  type PantryCategory,
  type PantryUnit,
  usePantryStore,
} from "@/store/usePantryStore";

const UNITS: readonly PantryUnit[] = ["units", "kg", "g", "l", "ml"];
const CATEGORIES: readonly PantryCategory[] = ["pantry", "fridge", "freezer"];

const CATEGORY_LABELS: Record<PantryCategory, string> = {
  pantry: "Pantry",
  fridge: "Fridge",
  freezer: "Freezer",
};

const UNIT_LABELS: Record<PantryUnit, string> = {
  units: "Units",
  kg: "Kilograms (kg)",
  g: "Grams (g)",
  l: "Liters (l)",
  ml: "Milliliters (ml)",
};

const selectClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:ring-zinc-100";

function formatExpiryDate(expiryDate: string): string {
  if (!expiryDate) {
    return "No expiry date";
  }

  const parsed = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return expiryDate;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PantryDemo() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<PantryUnit>("units");
  const [category, setCategory] = useState<PantryCategory>("pantry");
  const [expiryDate, setExpiryDate] = useState("");

  const items = usePantryStore((state) => state.items);
  const addItem = usePantryStore((state) => state.addItem);
  const clearItems = usePantryStore((state) => state.clearItems);

  const resetForm = () => {
    setName("");
    setQuantity("1");
    setUnit("units");
    setCategory("pantry");
    setExpiryDate("");
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
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        aria-label="Add pantry item"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="item-name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Item name
          </label>
          <Input
            id="item-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Olive oil"
            required
            autoComplete="off"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="item-quantity"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Quantity
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
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Unit
            </label>
            <select
              id="item-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value as PantryUnit)}
              className={selectClassName}
            >
              {UNITS.map((option) => (
                <option key={option} value={option}>
                  {UNIT_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="item-category"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Category
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
                  {CATEGORY_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="item-expiry"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Expiry date
            </label>
            <Input
              id="item-expiry"
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">Add item</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={clearItems}
            disabled={items.length === 0}
          >
            Clear all
          </Button>
        </div>
      </form>

      <section className="flex flex-col gap-3" aria-labelledby="pantry-items-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="pantry-items-heading"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Your pantry
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {items.length === 1 ? "1 item" : `${items.length} items`}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No items yet. Add something to your pantry.
          </p>
        ) : (
          <ul className="flex flex-col gap-3" aria-label="Pantry items">
            {items.map((item) => (
              <li key={item.id}>
                <Card padding="md" className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                      {item.name}
                    </h3>
                    <Badge variant="neutral">
                      {CATEGORY_LABELS[item.category]}
                    </Badge>
                  </div>
                  <dl className="grid gap-1 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
                    <div className="flex gap-1">
                      <dt className="font-medium text-zinc-700 dark:text-zinc-300">
                        Quantity:
                      </dt>
                      <dd>
                        {item.quantity} {item.unit}
                      </dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="font-medium text-zinc-700 dark:text-zinc-300">
                        Expires:
                      </dt>
                      <dd>{formatExpiryDate(item.expiryDate)}</dd>
                    </div>
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
