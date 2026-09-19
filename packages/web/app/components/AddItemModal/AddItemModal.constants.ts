import type { MessageKey } from "@/i18n/messages";
import type { PantryCategory, PantryUnit } from "@/store/usePantryStore";

export const UNITS: readonly PantryUnit[] = ["units", "kg", "g", "l", "ml"];

export const CATEGORIES: readonly PantryCategory[] = [
  "pantry",
  "fridge",
  "freezer",
];

export const UNIT_MESSAGE_KEYS: Record<PantryUnit, MessageKey> = {
  units: "unit.units",
  kg: "unit.kg",
  g: "unit.g",
  l: "unit.l",
  ml: "unit.ml",
};

export const CATEGORY_MESSAGE_KEYS: Record<PantryCategory, MessageKey> = {
  pantry: "category.pantry",
  fridge: "category.fridge",
  freezer: "category.freezer",
};

export const SELECT_CLASS_NAME =
  "h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";
