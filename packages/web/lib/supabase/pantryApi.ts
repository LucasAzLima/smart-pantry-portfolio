import type { createClient } from "@/lib/supabase/client";
import type {
  PantryCategory,
  PantryItemInsert,
  PantryItemRow,
  PantryItemUpdate,
  PantryUnit,
} from "@/lib/supabase/database.types";
import {
  type PantryItem,
  pantryItemFromRow,
} from "@/lib/supabase/pantryItem";
import type { CategoryFilter } from "@/lib/filterPantryItems";
import { DEFAULT_INVENTORY_PAGE_SIZE } from "@/lib/paginateItems";
import {
  DEFAULT_PANTRY_SORT,
  type PantrySortOption,
} from "@/lib/sortPantryItems";

export type PantrySupabaseClient = ReturnType<typeof createClient>;

export class PantryApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PantryApiError";
  }
}

export interface CreatePantryItemInput {
  name: string;
  quantity: number;
  unit: PantryUnit;
  category: PantryCategory;
  expiryDate: string;
}

export interface ListPantryItemsQuery {
  search?: string;
  category?: CategoryFilter;
  sortBy?: PantrySortOption;
  page?: number;
  pageSize?: number;
}

export interface ListPantryItemsResult {
  items: PantryItem[];
  totalCount: number;
  inventoryTotal: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function toErrorMessage(error: { message?: string } | null, fallback: string): string {
  if (error?.message && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}

/** Escapes `\`, `%`, and `_` so user search is treated as a literal in ILIKE. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function resolveSort(sortBy: PantrySortOption): {
  column: "name" | "expiry_date" | "quantity";
  ascending: boolean;
  nullsFirst?: boolean;
} {
  switch (sortBy) {
    case "name-asc":
      return { column: "name", ascending: true };
    case "expiry-asc":
      return { column: "expiry_date", ascending: true, nullsFirst: false };
    case "quantity-desc":
      return { column: "quantity", ascending: false };
  }
}

export async function getAuthenticatedUserId(
  supabase: PantrySupabaseClient,
): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new PantryApiError(toErrorMessage(error, "Unable to verify your session."));
  }

  if (!user) {
    throw new PantryApiError("You must be signed in to manage pantry items.");
  }

  return user.id;
}

export async function listPantryItems(
  supabase: PantrySupabaseClient,
  userId: string,
  query: ListPantryItemsQuery = {},
): Promise<ListPantryItemsResult> {
  const search = query.search?.trim() ?? "";
  const category = query.category ?? "all";
  const sortBy = query.sortBy ?? DEFAULT_PANTRY_SORT;
  const pageSize = Math.max(
    1,
    Math.floor(query.pageSize ?? DEFAULT_INVENTORY_PAGE_SIZE),
  );
  const requestedPage = Math.max(1, Math.floor(query.page ?? 1));
  const sort = resolveSort(sortBy);

  const inventoryCountPromise = supabase
    .from("pantry_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const applyFiltersAndSort = <
    T extends {
      eq: (column: string, value: string) => T;
      ilike: (column: string, pattern: string) => T;
      order: (
        column: string,
        options: { ascending: boolean; nullsFirst?: boolean },
      ) => T;
    },
  >(
    queryBuilder: T,
  ): T => {
    let next = queryBuilder;

    if (category !== "all") {
      next = next.eq("category", category);
    }

    if (search !== "") {
      next = next.ilike("name", `%${escapeIlikePattern(search)}%`);
    }

    next = next.order(sort.column, {
      ascending: sort.ascending,
      ...(sort.nullsFirst !== undefined
        ? { nullsFirst: sort.nullsFirst }
        : {}),
    });

    // Stable tie-breaker so pagination does not shuffle equal sort keys.
    if (sort.column !== "name") {
      next = next.order("name", { ascending: true });
    }

    return next;
  };

  const provisionalFrom = (requestedPage - 1) * pageSize;
  const provisionalTo = provisionalFrom + pageSize - 1;

  const filteredQuery = applyFiltersAndSort(
    supabase
      .from("pantry_items")
      .select("*", { count: "exact" })
      .eq("user_id", userId),
  );

  const [inventoryResult, filteredResult] = await Promise.all([
    inventoryCountPromise,
    filteredQuery.range(provisionalFrom, provisionalTo),
  ]);

  if (inventoryResult.error) {
    throw new PantryApiError(
      toErrorMessage(inventoryResult.error, "Unable to load pantry items."),
    );
  }

  if (filteredResult.error) {
    throw new PantryApiError(
      toErrorMessage(filteredResult.error, "Unable to load pantry items."),
    );
  }

  const inventoryTotal = inventoryResult.count ?? 0;
  const totalCount = filteredResult.count ?? 0;
  const totalPages =
    totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
  const page =
    totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);

  // If the requested page was past the end, re-fetch the last valid page.
  if (page !== requestedPage && totalPages > 0) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const retry = await applyFiltersAndSort(
      supabase.from("pantry_items").select("*").eq("user_id", userId),
    ).range(from, to);

    if (retry.error) {
      throw new PantryApiError(
        toErrorMessage(retry.error, "Unable to load pantry items."),
      );
    }

    return {
      items: (retry.data as PantryItemRow[] | null ?? []).map(pantryItemFromRow),
      totalCount,
      inventoryTotal,
      page,
      pageSize,
      totalPages,
    };
  }

  return {
    items: (filteredResult.data as PantryItemRow[] | null ?? []).map(
      pantryItemFromRow,
    ),
    totalCount,
    inventoryTotal,
    page,
    pageSize,
    totalPages,
  };
}

export async function insertPantryItem(
  supabase: PantrySupabaseClient,
  userId: string,
  input: CreatePantryItemInput,
): Promise<PantryItem> {
  const payload: PantryItemInsert = {
    user_id: userId,
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    category: input.category,
    expiry_date: input.expiryDate.trim() === "" ? null : input.expiryDate,
  };

  const { data, error } = await supabase
    .from("pantry_items")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new PantryApiError(toErrorMessage(error, "Unable to add pantry item."));
  }

  return pantryItemFromRow(data as PantryItemRow);
}

export async function updatePantryItem(
  supabase: PantrySupabaseClient,
  itemId: string,
  input: CreatePantryItemInput,
): Promise<PantryItem> {
  const payload: PantryItemUpdate = {
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    category: input.category,
    expiry_date: input.expiryDate.trim() === "" ? null : input.expiryDate,
  };

  const { data, error } = await supabase
    .from("pantry_items")
    .update(payload)
    .eq("id", itemId)
    .select("*")
    .single();

  if (error || !data) {
    throw new PantryApiError(toErrorMessage(error, "Unable to update pantry item."));
  }

  return pantryItemFromRow(data as PantryItemRow);
}

export async function updatePantryItemQuantity(
  supabase: PantrySupabaseClient,
  itemId: string,
  quantity: number,
): Promise<void> {
  const { error } = await supabase
    .from("pantry_items")
    .update({ quantity })
    .eq("id", itemId);

  if (error) {
    throw new PantryApiError(
      toErrorMessage(error, "Unable to update item quantity."),
    );
  }
}

export async function deletePantryItem(
  supabase: PantrySupabaseClient,
  itemId: string,
): Promise<void> {
  const { error } = await supabase.from("pantry_items").delete().eq("id", itemId);

  if (error) {
    throw new PantryApiError(toErrorMessage(error, "Unable to remove pantry item."));
  }
}

export async function deleteAllPantryItems(
  supabase: PantrySupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new PantryApiError(toErrorMessage(error, "Unable to clear pantry items."));
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}
