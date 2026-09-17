import type {
  PantryCategory,
  PantryItemRow,
  PantryUnit,
} from "@/lib/supabase/database.types";

/**
 * App-facing pantry item. Field names are camelCase; values map 1:1 to
 * `pantry_items` columns (see `PantryItemRow`).
 */
export interface PantryItem {
  id: string;
  /** Maps to `user_id`. Null while the item exists only in local storage. */
  userId: string | null;
  name: string;
  quantity: number;
  unit: PantryUnit;
  category: PantryCategory;
  /** Maps to `expiry_date`. Empty string when the DB value is null. */
  expiryDate: string;
  /** Maps to `created_at` (ISO 8601 timestamptz). */
  createdAt: string;
}

export function pantryItemFromRow(row: PantryItemRow): PantryItem {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    quantity: Number(row.quantity),
    unit: row.unit as PantryUnit,
    category: row.category as PantryCategory,
    expiryDate: row.expiry_date ?? "",
    createdAt: row.created_at,
  };
}

export function pantryItemToRow(item: PantryItem): PantryItemRow {
  if (!item.userId) {
    throw new Error("Cannot map a local pantry item without userId to a database row");
  }

  return {
    id: item.id,
    user_id: item.userId,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    expiry_date: item.expiryDate.trim() === "" ? null : item.expiryDate,
    created_at: item.createdAt,
  };
}
