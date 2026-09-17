import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PantryCategory, PantryUnit } from "@/lib/supabase/database.types";
import type { PantryItem } from "@/lib/supabase/pantryItem";

export type { PantryCategory, PantryUnit } from "@/lib/supabase/database.types";
export type { PantryItem } from "@/lib/supabase/pantryItem";

export const PANTRY_STORAGE_KEY = "smart-pantry-storage";
export const PANTRY_STORE_VERSION = 2;

export interface AddPantryItemInput {
  name: string;
  quantity?: number;
  unit?: PantryUnit;
  category?: PantryCategory;
  expiryDate?: string;
  userId?: string | null;
  createdAt?: string;
}

interface PantryState {
  items: PantryItem[];
  addItem: (input: AddPantryItemInput) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
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

function normalizeUserId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeCreatedAt(value: unknown): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }

  return new Date().toISOString();
}

function normalizePantryItem(value: unknown): PantryItem | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Partial<PantryItem> & {
    name?: unknown;
    id?: unknown;
    user_id?: unknown;
    expiry_date?: unknown;
    created_at?: unknown;
  };

  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") {
    return null;
  }

  const trimmedName = candidate.name.trim();
  if (!trimmedName) {
    return null;
  }

  const expiryDate =
    typeof candidate.expiryDate === "string"
      ? candidate.expiryDate
      : typeof candidate.expiry_date === "string"
        ? candidate.expiry_date
        : undefined;

  const userId =
    candidate.userId !== undefined
      ? candidate.userId
      : candidate.user_id !== undefined
        ? candidate.user_id
        : null;

  const createdAt =
    candidate.createdAt !== undefined
      ? candidate.createdAt
      : candidate.created_at !== undefined
        ? candidate.created_at
        : undefined;

  return {
    id: candidate.id,
    userId: normalizeUserId(userId),
    name: trimmedName,
    quantity: normalizeQuantity(candidate.quantity),
    unit: normalizeUnit(candidate.unit),
    category: normalizeCategory(candidate.category),
    expiryDate: normalizeExpiryDate(expiryDate),
    createdAt: normalizeCreatedAt(createdAt),
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
              userId: normalizeUserId(input.userId),
              name: trimmedName,
              quantity: normalizeQuantity(input.quantity),
              unit: normalizeUnit(input.unit),
              category: normalizeCategory(input.category),
              expiryDate: normalizeExpiryDate(input.expiryDate),
              createdAt: normalizeCreatedAt(input.createdAt),
            },
          ],
        }));
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateItemQuantity: (id, quantity) => {
        if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        }));
      },
      clearItems: () => set({ items: [] }),
    }),
    {
      name: PANTRY_STORAGE_KEY,
      version: PANTRY_STORE_VERSION,
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
