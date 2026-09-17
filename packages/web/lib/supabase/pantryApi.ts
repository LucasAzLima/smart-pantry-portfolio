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

function toErrorMessage(error: { message?: string } | null, fallback: string): string {
  if (error?.message && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
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
): Promise<PantryItem[]> {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new PantryApiError(toErrorMessage(error, "Unable to load pantry items."));
  }

  return (data as PantryItemRow[] | null ?? []).map(pantryItemFromRow);
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
