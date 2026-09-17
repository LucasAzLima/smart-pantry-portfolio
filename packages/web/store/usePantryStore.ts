import { create } from "zustand";
import { persist } from "zustand/middleware";

export const PANTRY_STORAGE_KEY = "smart-pantry-storage";

export type PantryUnit = "units" | "kg" | "g" | "l" | "ml";
export type PantryCategory = "pantry" | "fridge" | "freezer";

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: PantryUnit;
  category: PantryCategory;
  expiryDate: string;
}

export interface AddPantryItemInput {
  name: string;
  quantity?: number;
  unit?: PantryUnit;
  category?: PantryCategory;
  expiryDate?: string;
}

interface PantryState {
  items: PantryItem[];
  addItem: (input: AddPantryItemInput) => void;
  clearItems: () => void;
}

interface PersistedPantryState {
  items: PantryItem[];
}

const DEFAULT_QUANTITY = 1;
const DEFAULT_UNIT: PantryUnit = "units";
const DEFAULT_CATEGORY: PantryCategory = "pantry";
const DEFAULT_EXPIRY_DATE = "";

const PANTRY_UNITS: ReadonlySet<string> = new Set([
  "units",
  "kg",
  "g",
  "l",
  "ml",
]);

const PANTRY_CATEGORIES: ReadonlySet<string> = new Set([
  "pantry",
  "fridge",
  "freezer",
]);

function normalizeQuantity(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_QUANTITY;
  }

  return value;
}

function normalizeUnit(value: string | undefined): PantryUnit {
  if (value && PANTRY_UNITS.has(value)) {
    return value as PantryUnit;
  }

  return DEFAULT_UNIT;
}

function normalizeCategory(value: string | undefined): PantryCategory {
  if (value && PANTRY_CATEGORIES.has(value)) {
    return value as PantryCategory;
  }

  return DEFAULT_CATEGORY;
}

function normalizeExpiryDate(value: string | undefined): string {
  if (typeof value !== "string") {
    return DEFAULT_EXPIRY_DATE;
  }

  return value.trim();
}

function normalizePantryItem(value: unknown): PantryItem | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Partial<PantryItem> & { name?: unknown; id?: unknown };
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") {
    return null;
  }

  const trimmedName = candidate.name.trim();
  if (!trimmedName) {
    return null;
  }

  return {
    id: candidate.id,
    name: trimmedName,
    quantity: normalizeQuantity(candidate.quantity),
    unit: normalizeUnit(candidate.unit),
    category: normalizeCategory(candidate.category),
    expiryDate: normalizeExpiryDate(candidate.expiryDate),
  };
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (input) => {
        const trimmedName = input.name.trim();
        if (!trimmedName) {
          return;
        }

        set((state) => ({
          items: [
            ...state.items,
            {
              id: crypto.randomUUID(),
              name: trimmedName,
              quantity: normalizeQuantity(input.quantity),
              unit: normalizeUnit(input.unit),
              category: normalizeCategory(input.category),
              expiryDate: normalizeExpiryDate(input.expiryDate),
            },
          ],
        }));
      },
      clearItems: () => set({ items: [] }),
    }),
    {
      name: PANTRY_STORAGE_KEY,
      version: 1,
      partialize: (state): PersistedPantryState => ({ items: state.items }),
      migrate: (persistedState): PersistedPantryState => {
        if (typeof persistedState !== "object" || persistedState === null) {
          return { items: [] };
        }

        const { items } = persistedState as { items?: unknown };
        if (!Array.isArray(items)) {
          return { items: [] };
        }

        return {
          items: items
            .map((item) => normalizePantryItem(item))
            .filter((item): item is PantryItem => item !== null),
        };
      },
    },
  ),
);
