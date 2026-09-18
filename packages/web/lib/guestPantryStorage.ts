import type { PantryItem } from "@/lib/supabase/pantryItem";

export const GUEST_PANTRY_STORAGE_KEY = "smart-pantry-guest-v1";

interface GuestPantryStoragePayload {
  version: 1;
  items: PantryItem[];
}

function isPantryItem(value: unknown): value is PantryItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    (item.userId === null || typeof item.userId === "string") &&
    typeof item.name === "string" &&
    typeof item.quantity === "number" &&
    typeof item.unit === "string" &&
    typeof item.category === "string" &&
    typeof item.expiryDate === "string" &&
    typeof item.createdAt === "string"
  );
}

export function loadGuestPantryItems(): PantryItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(GUEST_PANTRY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as GuestPantryStoragePayload;
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) {
      return [];
    }

    return parsed.items.filter(isPantryItem);
  } catch {
    return [];
  }
}

export function saveGuestPantryItems(items: PantryItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: GuestPantryStoragePayload = {
    version: 1,
    items,
  };

  try {
    window.localStorage.setItem(
      GUEST_PANTRY_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore quota / private-mode failures; in-memory state still works.
  }
}

export function clearGuestPantryItems(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(GUEST_PANTRY_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
