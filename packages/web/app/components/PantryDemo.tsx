"use client";

import { Button, Card, Input } from "@smart-pantry/ui";
import { useEffect, useMemo, useState } from "react";
import { AddItemModal } from "./AddItemModal";
import { RemoveItemModal } from "./RemoveItemModal";
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
  type PantryItem,
  usePantryStore,
} from "@/store/usePantryStore";

const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  "all",
  "pantry",
  "fridge",
  "freezer",
];

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

const CATEGORY_ACCENT_STYLES: Record<PantryCategory, string> = {
  pantry: "bg-amber-500",
  fridge: "bg-sky-500",
  freezer: "bg-indigo-500",
};

const CATEGORY_BADGE_STYLES: Record<PantryCategory, string> = {
  pantry: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  fridge: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200",
  freezer: "bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-200",
};

const EXPIRY_LABEL_KEYS: Record<Exclude<ExpiryStatus, "none">, MessageKey> = {
  expired: "expiry.expired",
  warning: "expiry.warning",
  fresh: "expiry.fresh",
};

const EXPIRY_BADGE_STYLES: Record<Exclude<ExpiryStatus, "none">, string> = {
  expired: "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  fresh: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
};

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

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${EXPIRY_BADGE_STYLES[status]}`}
    >
      {t(EXPIRY_LABEL_KEYS[status])}
    </span>
  );
}

export function PantryDemo() {
  const { t, locale } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemPendingEdit, setItemPendingEdit] = useState<PantryItem | null>(
    null,
  );
  const [itemPendingRemoval, setItemPendingRemoval] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const items = usePantryStore((state) => state.items);
  const status = usePantryStore((state) => state.status);
  const error = usePantryStore((state) => state.error);
  const isMutating = usePantryStore((state) => state.isMutating);
  const fetchItems = usePantryStore((state) => state.fetchItems);
  const removeItem = usePantryStore((state) => state.removeItem);
  const updateItemQuantity = usePantryStore((state) => state.updateItemQuantity);
  const clearItems = usePantryStore((state) => state.clearItems);
  const clearError = usePantryStore((state) => state.clearError);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

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

  const mutationError =
    status === "idle" && error !== null
      ? error
      : null;

  const handleConfirmRemove = async () => {
    if (!itemPendingRemoval) {
      return;
    }

    setIsRemoving(true);
    const succeeded = await removeItem(itemPendingRemoval.id);
    setIsRemoving(false);

    if (succeeded) {
      setItemPendingRemoval(null);
    }
  };

  const handleClearAll = () => {
    void clearItems();
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            disabled={status === "loading" || status === "error"}
          >
            {t("form.addNewItem")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAll}
            disabled={items.length === 0 || isMutating || status === "loading"}
          >
            {t("form.clearAll")}
          </Button>
        </div>
      </div>

      {mutationError ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <p>{t("inventory.actionError")}</p>
          <Button type="button" size="sm" variant="outline" onClick={clearError}>
            {t("inventory.dismissError")}
          </Button>
        </div>
      ) : null}

      <AddItemModal
        key={itemPendingEdit?.id ?? "create"}
        open={isAddModalOpen || itemPendingEdit !== null}
        item={itemPendingEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setItemPendingEdit(null);
        }}
      />

      <RemoveItemModal
        open={itemPendingRemoval !== null}
        itemName={itemPendingRemoval?.name ?? ""}
        isLoading={isRemoving}
        onCancel={() => {
          if (!isRemoving) {
            setItemPendingRemoval(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmRemove();
        }}
      />

      <section
        id="inventory"
        className="flex flex-col gap-4"
        aria-labelledby="pantry-items-heading"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="pantry-items-heading"
            className="text-lg font-semibold text-zinc-900"
          >
            {t("inventory.heading")}
          </h2>
          <p className="text-sm text-zinc-500">{itemCountLabel}</p>
        </div>

        {status === "loading" ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10">
            <p className="text-sm text-zinc-500">{t("inventory.loading")}</p>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-10">
            <p className="text-sm text-red-800">{t("inventory.loadError")}</p>
            <Button type="button" onClick={() => void fetchItems()}>
              {t("inventory.retry")}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10">
            <p className="text-sm text-zinc-500">{t("inventory.empty")}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
              <div className="flex w-full max-w-md flex-col gap-2">
                <label
                  htmlFor="pantry-search"
                  className="text-sm font-medium text-zinc-700"
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
              <p className="text-sm text-zinc-500">{t("inventory.noMatches")}</p>
            ) : (
              <ul
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                aria-label={t("inventory.listAria")}
              >
                {filteredItems.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <Card
                      padding="none"
                      className="relative flex h-full flex-col overflow-hidden border-zinc-200/90 bg-white shadow-sm"
                    >
                      <div
                        className={`absolute inset-y-0 left-0 w-1.5 ${CATEGORY_ACCENT_STYLES[item.category]}`}
                        aria-hidden="true"
                      />
                      <div className="flex h-full flex-col gap-3 bg-white p-5 pl-6">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="text-base font-semibold tracking-tight text-zinc-900">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_BADGE_STYLES[item.category]}`}
                            >
                              {t(CATEGORY_MESSAGE_KEYS[item.category])}
                            </span>
                            <ExpiryStatusBadge expiryDate={item.expiryDate} />
                          </div>
                        </div>
                        <dl className="grid gap-1.5 text-sm text-zinc-600">
                          <div className="flex gap-1">
                            <dt className="font-medium text-zinc-500">
                              {t("item.quantity")}
                            </dt>
                            <dd className="text-zinc-800">
                              {item.quantity} {item.unit}
                            </dd>
                          </div>
                          <div className="flex gap-1">
                            <dt className="font-medium text-zinc-500">
                              {t("item.expires")}
                            </dt>
                            <dd className="text-zinc-800">
                              {formatExpiryDate(
                                item.expiryDate,
                                locale,
                                t("item.noExpiry"),
                              )}
                            </dd>
                          </div>
                        </dl>
                        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
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
                              disabled={item.quantity <= 1 || isMutating}
                              onClick={() => {
                                void updateItemQuantity(
                                  item.id,
                                  item.quantity - 1,
                                );
                              }}
                            >
                              −
                            </Button>
                            <span className="min-w-10 text-center text-sm font-medium text-zinc-900">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={t("item.increaseAria", {
                                name: item.name,
                              })}
                              disabled={isMutating}
                              onClick={() => {
                                void updateItemQuantity(
                                  item.id,
                                  item.quantity + 1,
                                );
                              }}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={t("item.editAria", {
                              name: item.name,
                            })}
                            disabled={isMutating}
                            onClick={() => setItemPendingEdit(item)}
                          >
                            {t("item.edit")}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={t("item.removeAria", {
                              name: item.name,
                            })}
                            disabled={isMutating}
                            onClick={() =>
                              setItemPendingRemoval({
                                id: item.id,
                                name: item.name,
                              })
                            }
                          >
                            {t("item.remove")}
                          </Button>
                        </div>
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
