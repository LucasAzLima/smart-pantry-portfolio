import { create } from "zustand";
import {
  type CategoryFilter,
} from "@/lib/filterPantryItems";
import {
  DEFAULT_PANTRY_SORT,
  isPantrySortOption,
  type PantrySortOption,
} from "@/lib/sortPantryItems";

const CATEGORY_FILTERS: ReadonlySet<string> = new Set([
  "all",
  "pantry",
  "fridge",
  "freezer",
]);

function isCategoryFilter(value: string): value is CategoryFilter {
  return CATEGORY_FILTERS.has(value);
}

interface InventoryFilterState {
  category: CategoryFilter;
  sortBy: PantrySortOption;
  setCategory: (category: CategoryFilter) => void;
  setSortBy: (sortBy: PantrySortOption) => void;
}

export const useInventoryFilterStore = create<InventoryFilterState>((set) => ({
  category: "all",
  sortBy: DEFAULT_PANTRY_SORT,
  setCategory: (category) => {
    if (!isCategoryFilter(category)) {
      return;
    }

    set({ category });
  },
  setSortBy: (sortBy) => {
    if (!isPantrySortOption(sortBy)) {
      return;
    }

    set({ sortBy });
  },
}));
