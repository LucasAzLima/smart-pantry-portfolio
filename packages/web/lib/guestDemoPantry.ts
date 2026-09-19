import type { PantryItem } from "@/lib/supabase/pantryItem";
import {
  GUEST_PANTRY_STORAGE_KEY,
  loadGuestPantryItems,
  saveGuestPantryItems,
} from "@/lib/guestPantryStorage";

/** Stable id prefix for first-visit sample pantry rows. */
export const GUEST_DEMO_ITEM_ID_PREFIX = "guest-demo-";

export function isGuestDemoItemId(id: string): boolean {
  return id.startsWith(GUEST_DEMO_ITEM_ID_PREFIX);
}

/** True when local guest storage still holds at least one sample demo row. */
export function guestStorageHasDemoItems(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return loadGuestPantryItems().some((item) => isGuestDemoItemId(item.id));
}

/**
 * Returns a local-calendar `YYYY-MM-DD` date offset by `days` from `now`.
 */
export function isoDateOffset(days: number, now: Date = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Builds the fixed sample pantry used for first-time guest demos.
 * Expiry dates are relative to `now` so badges stay correct over time.
 */
export function createSampleGuestItems(now: Date = new Date()): PantryItem[] {
  const createdAt = now.toISOString();

  return [
    {
      id: "guest-demo-rice",
      userId: null,
      name: "Rice",
      quantity: 2,
      unit: "kg",
      category: "pantry",
      expiryDate: isoDateOffset(45, now),
      createdAt,
    },
    {
      id: "guest-demo-pasta",
      userId: null,
      name: "Pasta",
      quantity: 500,
      unit: "g",
      category: "pantry",
      expiryDate: isoDateOffset(90, now),
      createdAt,
    },
    {
      id: "guest-demo-oil",
      userId: null,
      name: "Olive oil",
      quantity: 1,
      unit: "l",
      category: "pantry",
      expiryDate: "",
      createdAt,
    },
    {
      id: "guest-demo-milk",
      userId: null,
      name: "Milk",
      quantity: 1,
      unit: "l",
      category: "fridge",
      expiryDate: isoDateOffset(3, now),
      createdAt,
    },
    {
      id: "guest-demo-yogurt",
      userId: null,
      name: "Yogurt",
      quantity: 4,
      unit: "units",
      category: "fridge",
      expiryDate: isoDateOffset(-2, now),
      createdAt,
    },
    {
      id: "guest-demo-eggs",
      userId: null,
      name: "Eggs",
      quantity: 12,
      unit: "units",
      category: "fridge",
      expiryDate: isoDateOffset(12, now),
      createdAt,
    },
    {
      id: "guest-demo-peas",
      userId: null,
      name: "Frozen peas",
      quantity: 500,
      unit: "g",
      category: "freezer",
      expiryDate: isoDateOffset(60, now),
      createdAt,
    },
    {
      id: "guest-demo-chicken",
      userId: null,
      name: "Chicken",
      quantity: 1,
      unit: "kg",
      category: "freezer",
      expiryDate: isoDateOffset(14, now),
      createdAt,
    },
  ];
}

/**
 * On the first guest visit (storage key absent), seeds sample items and
 * persists them. If the key already exists — including an empty list after
 * Clear all — returns the stored items without re-seeding.
 */
export function loadOrSeedGuestPantryItems(): PantryItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  if (window.localStorage.getItem(GUEST_PANTRY_STORAGE_KEY) === null) {
    const sampleItems = createSampleGuestItems();
    saveGuestPantryItems(sampleItems);
    return sampleItems;
  }

  return loadGuestPantryItems();
}
