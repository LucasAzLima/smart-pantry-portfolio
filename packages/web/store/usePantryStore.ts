import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { PantryCategory, PantryUnit } from "@/lib/supabase/database.types";
import type { PantryItem } from "@/lib/supabase/pantryItem";
import type { CategoryFilter } from "@/lib/filterPantryItems";
import { DEFAULT_INVENTORY_PAGE_SIZE } from "@/lib/paginateItems";
import {
  DEFAULT_PANTRY_SORT,
  type PantrySortOption,
} from "@/lib/sortPantryItems";
import {
  deleteAllPantryItems,
  deletePantryItem,
  getAuthenticatedUserId,
  getErrorMessage,
  insertPantryItem,
  listPantryItems,
  type ListPantryItemsQuery,
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

export interface PantryListQuery {
  search: string;
  category: CategoryFilter;
  sortBy: PantrySortOption;
  page: number;
  pageSize: number;
}

interface PantryState {
  items: PantryItem[];
  /** Cached auth user id; avoids calling getUser on every filter/fetch. */
  userId: string | null;
  totalCount: number;
  inventoryTotal: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: PantryListQuery;
  status: PantryStatus;
  error: string | null;
  isMutating: boolean;
  fetchItems: (params?: Partial<PantryListQuery>) => Promise<void>;
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

const DEFAULT_QUERY: PantryListQuery = {
  search: "",
  category: "all",
  sortBy: DEFAULT_PANTRY_SORT,
  page: 1,
  pageSize: DEFAULT_INVENTORY_PAGE_SIZE,
};

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

function mergeQuery(
  current: PantryListQuery,
  params: Partial<PantryListQuery> | undefined,
): PantryListQuery {
  if (!params) {
    return current;
  }

  return {
    search: params.search ?? current.search,
    category: params.category ?? current.category,
    sortBy: params.sortBy ?? current.sortBy,
    page: params.page ?? current.page,
    pageSize: params.pageSize ?? current.pageSize,
  };
}

function toApiQuery(query: PantryListQuery): ListPantryItemsQuery {
  return {
    search: query.search,
    category: query.category,
    sortBy: query.sortBy,
    page: query.page,
    pageSize: query.pageSize,
  };
}

type PantrySupabaseClient = ReturnType<typeof createClient>;

async function resolveUserId(
  supabase: PantrySupabaseClient,
  get: () => PantryState,
  set: (
    partial:
      | Partial<PantryState>
      | ((state: PantryState) => Partial<PantryState>),
  ) => void,
): Promise<string> {
  const cached = get().userId;
  if (cached) {
    return cached;
  }

  try {
    const userId = await getAuthenticatedUserId(supabase);
    set({ userId });
    return userId;
  } catch (error) {
    set({ userId: null });
    throw error;
  }
}

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  userId: null,
  totalCount: 0,
  inventoryTotal: 0,
  page: 1,
  pageSize: DEFAULT_INVENTORY_PAGE_SIZE,
  totalPages: 0,
  query: DEFAULT_QUERY,
  status: "idle",
  error: null,
  isMutating: false,

  clearError: () => {
    set({ error: null });
  },

  fetchItems: async (params) => {
    const previous = get();
    const nextQuery = mergeQuery(previous.query, params);
    const keepListVisible =
      previous.status !== "error" &&
      (previous.items.length > 0 ||
        previous.totalCount > 0 ||
        previous.inventoryTotal > 0);

    set({
      status: keepListVisible ? "idle" : "loading",
      error: null,
      query: nextQuery,
    });

    try {
      const supabase = createClient();
      const userId = await resolveUserId(supabase, get, set);
      const result = await listPantryItems(
        supabase,
        userId,
        toApiQuery(nextQuery),
      );

      set({
        items: result.items,
        totalCount: result.totalCount,
        inventoryTotal: result.inventoryTotal,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        query: {
          ...nextQuery,
          page: result.page,
          pageSize: result.pageSize,
        },
        status: "idle",
        error: null,
      });
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
      const userId = await resolveUserId(supabase, get, set);
      await insertPantryItem(supabase, userId, {
        name: trimmedName,
        quantity: normalizeQuantity(input.quantity),
        unit: normalizeUnit(input.unit),
        category: normalizeCategory(input.category),
        expiryDate: normalizeExpiryDate(input.expiryDate),
      });

      const result = await listPantryItems(
        supabase,
        userId,
        toApiQuery(get().query),
      );

      set({
        items: result.items,
        totalCount: result.totalCount,
        inventoryTotal: result.inventoryTotal,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        query: {
          ...get().query,
          page: result.page,
          pageSize: result.pageSize,
        },
        isMutating: false,
        error: null,
        status: "idle",
      });

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
    const previous = {
      items: get().items,
      totalCount: get().totalCount,
      inventoryTotal: get().inventoryTotal,
      page: get().page,
      pageSize: get().pageSize,
      totalPages: get().totalPages,
    };

    set({
      items: previous.items.filter((item) => item.id !== id),
      isMutating: true,
      error: null,
    });

    try {
      const supabase = createClient();
      const userId = await resolveUserId(supabase, get, set);
      await deletePantryItem(supabase, id);
      const result = await listPantryItems(
        supabase,
        userId,
        toApiQuery(get().query),
      );

      set({
        items: result.items,
        totalCount: result.totalCount,
        inventoryTotal: result.inventoryTotal,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        query: {
          ...get().query,
          page: result.page,
          pageSize: result.pageSize,
        },
        isMutating: false,
        error: null,
      });
      return true;
    } catch (error) {
      set({
        ...previous,
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
      const userId = await resolveUserId(supabase, get, set);
      await updatePantryItemApi(supabase, id, nextFields);
      const result = await listPantryItems(
        supabase,
        userId,
        toApiQuery(get().query),
      );

      set({
        items: result.items,
        totalCount: result.totalCount,
        inventoryTotal: result.inventoryTotal,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        query: {
          ...get().query,
          page: result.page,
          pageSize: result.pageSize,
        },
        isMutating: false,
        error: null,
      });
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
    const previous = {
      items: get().items,
      totalCount: get().totalCount,
      inventoryTotal: get().inventoryTotal,
      page: get().page,
      pageSize: get().pageSize,
      totalPages: get().totalPages,
    };

    if (previous.inventoryTotal === 0) {
      return true;
    }

    set({
      items: [],
      totalCount: 0,
      inventoryTotal: 0,
      page: 1,
      totalPages: 0,
      isMutating: true,
      error: null,
    });

    try {
      const supabase = createClient();
      const userId = await resolveUserId(supabase, get, set);
      await deleteAllPantryItems(supabase, userId);
      set({
        isMutating: false,
        error: null,
        query: { ...get().query, page: 1 },
      });
      return true;
    } catch (error) {
      set({
        ...previous,
        isMutating: false,
        error: getErrorMessage(error, "Unable to clear pantry items."),
      });
      return false;
    }
  },
}));
