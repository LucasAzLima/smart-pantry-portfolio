"use client";

import { Badge, Button, Card, Input, type BadgeVariant } from "@smart-pantry/ui";
import { useMemo, useState, type FormEvent } from "react";
import {
  calculateExpiryStatus,
  type ExpiryStatus,
} from "@/lib/expiryUtils";
import {
  filterPantryItems,
  type CategoryFilter,
} from "@/lib/filterPantryItems";
import { useTranslation } from "@/i18n/useTranslation";
import type { MessageKey } from "@/i18n/messages";
import {
  type PantryCategory,
  type PantryUnit,
  usePantryStore,
} from "@/store/usePantryStore";

const UNITS: readonly PantryUnit[] = ["units", "kg", "g", "l", "ml"];
const CATEGORIES: readonly PantryCategory[] = ["pantry", "fridge", "freezer"];
const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  "all",
  "pantry",
  "fridge",
  "freezer",
];

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

const CATEGORY_FILTER_MESSAGE_KEYS: Record<CategoryFilter, MessageKey> = {
  all: "filter.all",
  pantry: "category.pantry",
  fridge: "category.fridge",
  freezer: "category.freezer",
};

const EXPIRY_BADGE: Record<
  Exclude<ExpiryStatus, "none">,
  { variant: BadgeVariant; labelKey: MessageKey }
> = {
  expired: { variant: "danger", labelKey: "expiry.expired" },
  warning: { variant: "warning", labelKey: "expiry.warning" },
  fresh: { variant: "success", labelKey: "expiry.fresh" },
};

const selectClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:ring-zinc-100";

function formatExpiryDate(
  expiryDate: string,
  locale: string,
  noExpiryLabel: string,
): string {
  if (!expiryDate) {
    return noExpiryLabel;
  }

  const parsed = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return expiryDate;
  }

  return parsed.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ExpiryStatusBadge({ expiryDate }: { expiryDate: string }) {
  const { t } = useTranslation();
  const status = calculateExpiryStatus(expiryDate);
  if (status === "none") {
    return null;
  }

  const badge = EXPIRY_BADGE[status];
  return <Badge variant={badge.variant}>{t(badge.labelKey)}</Badge>;
}

export function PantryDemo() {
  const { t, locale } = useTranslation();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<PantryUnit>("units");
  const [category, setCategory] = useState<PantryCategory>("pantry");
  const [expiryDate, setExpiryDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const items = usePantryStore((state) => state.items);
  const addItem = usePantryStore((state) => state.addItem);
  const removeItem = usePantryStore((state) => state.removeItem);
  const updateItemQuantity = usePantryStore((state) => state.updateItemQuantity);
  const clearItems = usePantryStore((state) => state.clearItems);

  const filteredItems = useMemo(
    () =>
      filterPantryItems(items, {
        query: searchQuery,
        category: categoryFilter,
      }),
    [items, searchQuery, categoryFilter],
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 || categoryFilter !== "all";

  const itemCountLabel = (() => {
    if (items.length === 0) {
      return t("inventory.countZero");
    }

    if (hasActiveFilters) {
      return t("inventory.countFiltered", {
        filtered: filteredItems.length,
        total: items.length,
      });
    }

    if (items.length === 1) {
      return t("inventory.countOne");
    }

    return t("inventory.countMany", { count: items.length });
  })();

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
        aria-label={t("form.ariaLabel")}
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="item-name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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

        <div className="flex flex-wrap gap-3">
          <Button type="submit">{t("form.addItem")}</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={clearItems}
            disabled={items.length === 0}
          >
            {t("form.clearAll")}
          </Button>
        </div>
      </form>

      <section className="flex flex-col gap-3" aria-labelledby="pantry-items-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="pantry-items-heading"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {t("inventory.heading")}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {itemCountLabel}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("inventory.empty")}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pantry-search"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t("search.label")}
                </label>
                <Input
                  id="pantry-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("search.placeholder")}
                  autoComplete="off"
                />
              </div>

              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={t("filter.groupAria")}
              >
                {CATEGORY_FILTERS.map((filter) => {
                  const isSelected = categoryFilter === filter;
                  return (
                    <Button
                      key={filter}
                      type="button"
                      size="sm"
                      variant={isSelected ? "primary" : "outline"}
                      aria-pressed={isSelected}
                      onClick={() => setCategoryFilter(filter)}
                    >
                      {t(CATEGORY_FILTER_MESSAGE_KEYS[filter])}
                    </Button>
                  );
                })}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("inventory.noMatches")}
              </p>
            ) : (
              <ul className="flex flex-col gap-3" aria-label={t("inventory.listAria")}>
                {filteredItems.map((item) => (
                  <li key={item.id}>
                    <Card padding="md" className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="neutral">
                            {t(CATEGORY_MESSAGE_KEYS[item.category])}
                          </Badge>
                          <ExpiryStatusBadge expiryDate={item.expiryDate} />
                        </div>
                      </div>
                      <dl className="grid gap-1 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
                        <div className="flex gap-1">
                          <dt className="font-medium text-zinc-700 dark:text-zinc-300">
                            {t("item.quantity")}
                          </dt>
                          <dd>
                            {item.quantity} {item.unit}
                          </dd>
                        </div>
                        <div className="flex gap-1">
                          <dt className="font-medium text-zinc-700 dark:text-zinc-300">
                            {t("item.expires")}
                          </dt>
                          <dd>
                            {formatExpiryDate(
                              item.expiryDate,
                              locale,
                              t("item.noExpiry"),
                            )}
                          </dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className="inline-flex items-center gap-1"
                          role="group"
                          aria-label={t("item.adjustQuantityAria", {
                            name: item.name,
                          })}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={t("item.decreaseAria", {
                              name: item.name,
                            })}
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity - 1)
                            }
                          >
                            −
                          </Button>
                          <span className="min-w-10 text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={t("item.increaseAria", {
                              name: item.name,
                            })}
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={t("item.removeAria", { name: item.name })}
                          onClick={() => removeItem(item.id)}
                        >
                          {t("item.remove")}
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
