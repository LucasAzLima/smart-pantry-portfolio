import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { PantryCategory, PantryUnit } from "@/lib/supabase/database.types";
import type { PantryItem } from "@/lib/supabase/pantryItem";
import {
  deleteAllPantryItems,
  deletePantryItem,
  getAuthenticatedUserId,
  getErrorMessage,
  insertPantryItem,
  listPantryItems,
  updatePantryItem as updatePantryItemApi,
  updatePantryItemQuantity as updatePantryItemQuantityApi,
} from "@/lib/supabase/pantryApi";

export type { PantryCategory, PantryUnit } from "@/lib/supabase/database.types";
export type { PantryItem } from "@/lib/supabase/pantryItem";

export type PantryStatus = "idle" | "loading" | "error";

export interface AddPantryItemInput {
  name: string;
  quantity?: number;
  unit?: PantryUnit;
  category?: PantryCategory;
  expiryDate?: string;
}

export type UpdatePantryItemInput = AddPantryItemInput;

interface PantryState {
  items: PantryItem[];
  status: PantryStatus;
  error: string | null;
  isMutating: boolean;
  fetchItems: () => Promise<void>;
  addItem: (input: AddPantryItemInput) => Promise<boolean>;
  removeItem: (id: string) => Promise<boolean>;
  updateItem: (id: string, input: UpdatePantryItemInput) => Promise<boolean>;
  updateItemQuantity: (id: string, quantity: number) => Promise<boolean>;
  clearItems: () => Promise<boolean>;
  clearError: () => void;
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

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  status: "idle",
  error: null,
  isMutating: false,

  clearError: () => {
    set({ error: null });
  },

  fetchItems: async () => {
    set({ status: "loading", error: null });

    try {
      const supabase = createClient();
      const userId = await getAuthenticatedUserId(supabase);
      const items = await listPantryItems(supabase, userId);
      set({ items, status: "idle", error: null });
    } catch (error) {
      set({
        status: "error",
        error: getErrorMessage(error, "Unable to load pantry items."),
      });
    }
  },

  addItem: async (input) => {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return false;
    }

    set({ isMutating: true, error: null });

    try {
      const supabase = createClient();
      const userId = await getAuthenticatedUserId(supabase);
      const created = await insertPantryItem(supabase, userId, {
        name: trimmedName,
        quantity: normalizeQuantity(input.quantity),
        unit: normalizeUnit(input.unit),
        category: normalizeCategory(input.category),
        expiryDate: normalizeExpiryDate(input.expiryDate),
      });

      set((state) => ({
        items: [created, ...state.items],
        isMutating: false,
        error: null,
        status: "idle",
      }));

      return true;
    } catch (error) {
      set({
        isMutating: false,
        error: getErrorMessage(error, "Unable to add pantry item."),
      });
      return false;
    }
  },

  removeItem: async (id) => {
    const previousItems = get().items;
    set({
      items: previousItems.filter((item) => item.id !== id),
      isMutating: true,
      error: null,
    });

    try {
      const supabase = createClient();
      await deletePantryItem(supabase, id);
      set({ isMutating: false, error: null });
      return true;
    } catch (error) {
      set({
        items: previousItems,
        isMutating: false,
        error: getErrorMessage(error, "Unable to remove pantry item."),
      });
      return false;
    }
  },

  updateItem: async (id, input) => {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return false;
    }

    const previousItems = get().items;
    const target = previousItems.find((item) => item.id === id);
    if (!target) {
      return false;
    }

    const nextFields = {
      name: trimmedName,
      quantity: normalizeQuantity(input.quantity),
      unit: normalizeUnit(input.unit),
      category: normalizeCategory(input.category),
      expiryDate: normalizeExpiryDate(input.expiryDate),
    };

    if (
      target.name === nextFields.name &&
      target.quantity === nextFields.quantity &&
      target.unit === nextFields.unit &&
      target.category === nextFields.category &&
      target.expiryDate === nextFields.expiryDate
    ) {
      return true;
    }

    set({
      items: previousItems.map((item) =>
        item.id === id ? { ...item, ...nextFields } : item,
      ),
      isMutating: true,
      error: null,
    });

    try {
      const supabase = createClient();
      const updated = await updatePantryItemApi(supabase, id, nextFields);
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? updated : item)),
        isMutating: false,
        error: null,
      }));
      return true;
    } catch (error) {
      set({
        items: previousItems,
        isMutating: false,
        error: getErrorMessage(error, "Unable to update pantry item."),
      });
      return false;
    }
  },

  updateItemQuantity: async (id, quantity) => {
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
      return false;
    }

    const previousItems = get().items;
    const target = previousItems.find((item) => item.id === id);
    if (!target || target.quantity === quantity) {
      return false;
    }

    set({
      items: previousItems.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
      isMutating: true,
      error: null,
    });

    try {
      const supabase = createClient();
      await updatePantryItemQuantityApi(supabase, id, quantity);
      set({ isMutating: false, error: null });
      return true;
    } catch (error) {
      set({
        items: previousItems,
        isMutating: false,
        error: getErrorMessage(error, "Unable to update item quantity."),
      });
      return false;
    }
  },

  clearItems: async () => {
    const previousItems = get().items;
    if (previousItems.length === 0) {
      return true;
    }

    set({ items: [], isMutating: true, error: null });

    try {
      const supabase = createClient();
      const userId = await getAuthenticatedUserId(supabase);
      await deleteAllPantryItems(supabase, userId);
      set({ isMutating: false, error: null });
      return true;
    } catch (error) {
      set({
        items: previousItems,
        isMutating: false,
        error: getErrorMessage(error, "Unable to clear pantry items."),
      });
      return false;
    }
  },
}));
