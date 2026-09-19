import type { ExpiryStatus } from "@/lib/expiryUtils";
import type { CategoryFilter } from "@/lib/filterPantryItems";
import type { PantrySortOption } from "@/lib/sortPantryItems";
import type { MessageKey } from "@/i18n/messages";
import type { PantryCategory } from "@/store/usePantryStore";

export const SEARCH_DEBOUNCE_MS = 300;

export const SELECT_CLASS_NAME =
  "h-10 w-full min-w-[11rem] rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 sm:w-auto";

export const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  "all",
  "pantry",
  "fridge",
  "freezer",
];

export const SORT_MESSAGE_KEYS: Record<PantrySortOption, MessageKey> = {
  "name-asc": "sort.nameAsc",
  "expiry-asc": "sort.expiryAsc",
  "quantity-desc": "sort.quantityDesc",
};

export const CATEGORY_MESSAGE_KEYS: Record<PantryCategory, MessageKey> = {
  pantry: "category.pantry",
  fridge: "category.fridge",
  freezer: "category.freezer",
};

export const CATEGORY_FILTER_MESSAGE_KEYS: Record<CategoryFilter, MessageKey> = {
  all: "filter.all",
  pantry: "category.pantry",
  fridge: "category.fridge",
  freezer: "category.freezer",
};

export const CATEGORY_ACCENT_STYLES: Record<PantryCategory, string> = {
  pantry: "bg-amber-500",
  fridge: "bg-sky-500",
  freezer: "bg-indigo-500",
};

export const CATEGORY_BADGE_STYLES: Record<PantryCategory, string> = {
  pantry: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  fridge: "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200",
  freezer: "bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-200",
};

export const EXPIRY_LABEL_KEYS: Record<
  Exclude<ExpiryStatus, "none">,
  MessageKey
> = {
  expired: "expiry.expired",
  warning: "expiry.warning",
  fresh: "expiry.fresh",
};

export const EXPIRY_BADGE_STYLES: Record<
  Exclude<ExpiryStatus, "none">,
  string
> = {
  expired: "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  fresh: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
};
