import type { PantryCategory, PantryItem } from "@/store/usePantryStore";

export type CategoryFilter = "all" | PantryCategory;

export interface FilterPantryItemsOptions {
  query: string;
  category: CategoryFilter;
}

export function filterPantryItems(
  items: readonly PantryItem[],
  { query, category }: FilterPantryItemsOptions,
): PantryItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (category !== "all" && item.category !== category) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return item.name.toLowerCase().includes(normalizedQuery);
  });
}
