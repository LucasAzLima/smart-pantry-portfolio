import type { PantryItem } from "@/store/usePantryStore";

export const PANTRY_SORT_OPTIONS = [
  "name-asc",
  "expiry-asc",
  "quantity-desc",
] as const;

export type PantrySortOption = (typeof PANTRY_SORT_OPTIONS)[number];

export const DEFAULT_PANTRY_SORT: PantrySortOption = "name-asc";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isPantrySortOption(value: string): value is PantrySortOption {
  return (PANTRY_SORT_OPTIONS as readonly string[]).includes(value);
}

function expiryTimestamp(expiryDate: string): number | null {
  const trimmed = expiryDate.trim();
  if (!trimmed || !DATE_ONLY_PATTERN.test(trimmed)) {
    return null;
  }

  const parsed = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getTime();
}

function compareByName(a: PantryItem, b: PantryItem): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function compareByExpiryProximity(a: PantryItem, b: PantryItem): number {
  const aTime = expiryTimestamp(a.expiryDate);
  const bTime = expiryTimestamp(b.expiryDate);

  if (aTime === null && bTime === null) {
    return compareByName(a, b);
  }

  if (aTime === null) {
    return 1;
  }

  if (bTime === null) {
    return -1;
  }

  if (aTime !== bTime) {
    return aTime - bTime;
  }

  return compareByName(a, b);
}

function compareByQuantityDesc(a: PantryItem, b: PantryItem): number {
  if (a.quantity !== b.quantity) {
    return b.quantity - a.quantity;
  }

  return compareByName(a, b);
}

/**
 * Returns a new array sorted by the selected option.
 * Does not mutate the input.
 */
export function sortPantryItems(
  items: readonly PantryItem[],
  sortBy: PantrySortOption,
): PantryItem[] {
  switch (sortBy) {
    case "name-asc":
      return items.toSorted(compareByName);
    case "expiry-asc":
      return items.toSorted(compareByExpiryProximity);
    case "quantity-desc":
      return items.toSorted(compareByQuantityDesc);
  }
}
