import type { PantryItem } from "@/lib/supabase/pantryItem";
import {
  clearGuestPantryItems,
  GUEST_PANTRY_STORAGE_KEY,
  loadGuestPantryItems,
  saveGuestPantryItems,
} from "./guestPantryStorage";

function makeItem(overrides: Partial<PantryItem> = {}): PantryItem {
  return {
    id: "guest-1",
    userId: null,
    name: "Rice",
    quantity: 1,
    unit: "kg",
    category: "pantry",
    expiryDate: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("guestPantryStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty list when nothing is stored", () => {
    expect(loadGuestPantryItems()).toEqual([]);
  });

  it("round-trips guest items through localStorage", () => {
    const items = [makeItem(), makeItem({ id: "guest-2", name: "Beans" })];
    saveGuestPantryItems(items);

    expect(loadGuestPantryItems()).toEqual(items);
    expect(localStorage.getItem(GUEST_PANTRY_STORAGE_KEY)).toContain("Rice");
  });

  it("clears stored guest items", () => {
    saveGuestPantryItems([makeItem()]);
    clearGuestPantryItems();
    expect(loadGuestPantryItems()).toEqual([]);
  });

  it("ignores corrupt storage payloads", () => {
    localStorage.setItem(GUEST_PANTRY_STORAGE_KEY, "{not-json");
    expect(loadGuestPantryItems()).toEqual([]);
  });
});
