import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { PantryCategory, PantryUnit } from "@/lib/supabase/database.types";
import type { PantryItem } from "@/lib/supabase/pantryItem";
import { filterPantryItems } from "@/lib/filterPantryItems";
import type { CategoryFilter } from "@/lib/filterPantryItems";
import { loadOrSeedGuestPantryItems } from "@/lib/guestDemoPantry";
import {
  clearGuestPantryItems,
  loadGuestPantryItems,
  saveGuestPantryItems,
} from "@/lib/guestPantryStorage";
import {
  DEFAULT_INVENTORY_PAGE_SIZE,
  paginateItems,
} from "@/lib/paginateItems";
import {
  DEFAULT_PANTRY_SORT,
  sortPantryItems,
  type PantrySortOption,
} from "@/lib/sortPantryItems";
import {
  deleteAllPantryItems,
  deletePantryItem,
  getErrorMessage,
  getOptionalAuthenticatedUserId,
  insertPantryItem,
  insertPantryItems,
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
  /** True when operating against local guest storage (no session). */
  isGuest: boolean;
  totalCount: number;
  inventoryTotal: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: PantryListQuery;
  status: PantryStatus;
  error: string | null;
  isMutating: boolean;
  isMigratingGuest: boolean;
  fetchItems: (params?: Partial<PantryListQuery>) => Promise<void>;
  addItem: (input: AddPantryItemInput) => Promise<boolean>;
  removeItem: (id: string) => Promise<boolean>;
  updateItem: (id: string, input: UpdatePantryItemInput) => Promise<boolean>;
  updateItemQuantity: (id: string, quantity: number) => Promise<boolean>;
  clearItems: () => Promise<boolean>;
  /** Bulk-insert local guest items into Supabase after sign-in/sign-up. */
  migrateGuestItems: () => Promise<boolean>;
  /**
   * Drop the cached auth user id and server inventory so the store operates
   * as a guest again (e.g. after sign-out).
   */
  enterGuestSession: () => void;
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

function createGuestItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function applyGuestQuery(
  allItems: readonly PantryItem[],
  query: PantryListQuery,
): {
  items: PantryItem[];
  totalCount: number;
  inventoryTotal: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  const filtered = filterPantryItems(allItems, {
    query: query.search,
    category: query.category,
  });
  const sorted = sortPantryItems(filtered, query.sortBy);
  const pageResult = paginateItems(sorted, query.page, query.pageSize);

  return {
    items: pageResult.items,
    totalCount: pageResult.totalItems,
    inventoryTotal: allItems.length,
    page: pageResult.page,
    pageSize: pageResult.pageSize,
    totalPages: pageResult.totalPages,
  };
}

function setGuestListState(
  set: (
    partial:
      | Partial<PantryState>
      | ((state: PantryState) => Partial<PantryState>),
  ) => void,
  allItems: PantryItem[],
  query: PantryListQuery,
  extras: Partial<PantryState> = {},
): void {
  const list = applyGuestQuery(allItems, query);
  set({
    ...list,
    query: {
      ...query,
      page: list.page,
      pageSize: list.pageSize,
    },
    isGuest: true,
    userId: null,
    status: "idle",
    error: null,
    ...extras,
  });
}

type PantrySupabaseClient = ReturnType<typeof createClient>;

/** Serializes guest → Supabase migration so concurrent fetchItems cannot double-insert. */
let inFlightGuestMigration: Promise<void> | null = null;

/** Test-only: clears a stuck migration lock between Jest cases. */
export function resetGuestMigrationLockForTests(): void {
  inFlightGuestMigration = null;
}

async function migratePendingGuestItems(
  supabase: PantrySupabaseClient,
  userId: string,
): Promise<void> {
  if (inFlightGuestMigration) {
    await inFlightGuestMigration;
    return;
  }

  let settle!: () => void;
  inFlightGuestMigration = new Promise<void>((resolve) => {
    settle = resolve;
  });

  try {
    const pendingGuestItems = loadGuestPantryItems();
    if (pendingGuestItems.length === 0) {
      return;
    }

    // Claim before the network call so overlapping fetches cannot re-read the same items.
    clearGuestPantryItems();

    try {
      await insertPantryItems(
        supabase,
        userId,
        pendingGuestItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          expiryDate: item.expiryDate,
        })),
      );
    } catch (error) {
      saveGuestPantryItems(pendingGuestItems);
      throw error;
    }
  } finally {
    settle();
    inFlightGuestMigration = null;
  }
}

async function resolveUserId(
  supabase: PantrySupabaseClient,
  get: () => PantryState,
  set: (
    partial:
      | Partial<PantryState>
      | ((state: PantryState) => Partial<PantryState>),
  ) => void,
): Promise<string | null> {
  const cached = get().userId;
  if (cached) {
    return cached;
  }

  const userId = await getOptionalAuthenticatedUserId(supabase);
  set({ userId, isGuest: userId === null });
  return userId;
}

export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  userId: null,
  isGuest: true,
  totalCount: 0,
  inventoryTotal: 0,
  page: 1,
  pageSize: DEFAULT_INVENTORY_PAGE_SIZE,
  totalPages: 0,
  query: DEFAULT_QUERY,
  status: "idle",
  error: null,
  isMutating: false,
  isMigratingGuest: false,

  clearError: () => {
    set({ error: null });
  },

  enterGuestSession: () => {
    const previous = get();
    if (previous.userId === null && previous.isGuest) {
      return;
    }

    set({
      userId: null,
      isGuest: true,
      items: [],
      totalCount: 0,
      inventoryTotal: 0,
      page: 1,
      totalPages: 0,
      status: "idle",
      error: null,
      isMutating: false,
      isMigratingGuest: false,
    });
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

      if (!userId) {
        const guestItems = loadOrSeedGuestPantryItems();
        setGuestListState(set, guestItems, nextQuery);
        return;
      }

      await migratePendingGuestItems(supabase, userId);

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
        isGuest: false,
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

    const nextFields = {
      name: trimmedName,
      quantity: normalizeQuantity(input.quantity),
      unit: normalizeUnit(input.unit),
      category: normalizeCategory(input.category),
      expiryDate: normalizeExpiryDate(input.expiryDate),
    };

    try {
      const supabase = createClient();
      const userId = await resolveUserId(supabase, get, set);

      if (!userId) {
        const guestItems = loadGuestPantryItems();
        const created: PantryItem = {
          id: createGuestItemId(),
          userId: null,
          ...nextFields,
          createdAt: new Date().toISOString(),
        };
        const nextItems = [...guestItems, created];
        saveGuestPantryItems(nextItems);
        setGuestListState(set, nextItems, get().query, { isMutating: false });
        return true;
      }

      await insertPantryItem(supabase, userId, nextFields);

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
        isGuest: false,
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

      if (!userId) {
        const nextItems = loadGuestPantryItems().filter((item) => item.id !== id);
        saveGuestPantryItems(nextItems);
        setGuestListState(set, nextItems, get().query, { isMutating: false });
        return true;
      }

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
        isGuest: false,
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

      if (!userId) {
        const nextItems = loadGuestPantryItems().map((item) =>
          item.id === id ? { ...item, ...nextFields } : item,
        );
        saveGuestPantryItems(nextItems);
        setGuestListState(set, nextItems, get().query, { isMutating: false });
        return true;
      }

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
        isGuest: false,
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
      const userId = await resolveUserId(supabase, get, set);

      if (!userId) {
        const nextItems = loadGuestPantryItems().map((item) =>
          item.id === id ? { ...item, quantity } : item,
        );
        saveGuestPantryItems(nextItems);
        set({ isMutating: false, error: null, isGuest: true });
        return true;
      }

      await updatePantryItemQuantityApi(supabase, id, quantity);
      set({ isMutating: false, error: null, isGuest: false });
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

      if (!userId) {
        clearGuestPantryItems();
        set({
          isMutating: false,
          error: null,
          isGuest: true,
          query: { ...get().query, page: 1 },
        });
        return true;
      }

      await deleteAllPantryItems(supabase, userId);
      set({
        isMutating: false,
        error: null,
        isGuest: false,
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

  migrateGuestItems: async () => {
    set({ isMigratingGuest: true, error: null });

    try {
      const supabase = createClient();
      const userId = await resolveUserId(supabase, get, set);

      if (!userId) {
        set({ isMigratingGuest: false });
        return false;
      }

      await migratePendingGuestItems(supabase, userId);
      set({ isMigratingGuest: false, isGuest: false });
      await get().fetchItems({ page: 1 });
      return true;
    } catch (error) {
      set({
        isMigratingGuest: false,
        error: getErrorMessage(error, "Unable to migrate guest pantry items."),
      });
      return false;
    }
  },
}));
