import type { PantryItem } from "@/lib/supabase/pantryItem";
import { calculateExpiryStatus } from "@/lib/expiryUtils";
import {
  GUEST_PANTRY_STORAGE_KEY,
  saveGuestPantryItems,
} from "@/lib/guestPantryStorage";
import {
  createSampleGuestItems,
  guestStorageHasDemoItems,
  isGuestDemoItemId,
  isoDateOffset,
  loadOrSeedGuestPantryItems,
} from "./guestDemoPantry";

function makeItem(overrides: Partial<PantryItem> = {}): PantryItem {
  return {
    id: "guest-1",
    userId: null,
    name: "Custom",
    quantity: 1,
    unit: "kg",
    category: "pantry",
    expiryDate: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("guestDemoPantry", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("isoDateOffset", () => {
    it("formats local calendar dates relative to now", () => {
      const now = new Date(2026, 8, 19); // Sep 19, 2026 local

      expect(isoDateOffset(0, now)).toBe("2026-09-19");
      expect(isoDateOffset(3, now)).toBe("2026-09-22");
      expect(isoDateOffset(-2, now)).toBe("2026-09-17");
    });
  });

  describe("createSampleGuestItems", () => {
    it("returns eight items with stable ids and expiry badge coverage", () => {
      const now = new Date(2026, 8, 19, 12, 0, 0);
      const items = createSampleGuestItems(now);

      expect(items).toHaveLength(8);
      expect(items.every((item) => item.userId === null)).toBe(true);
      expect(items.map((item) => item.id)).toEqual([
        "guest-demo-rice",
        "guest-demo-pasta",
        "guest-demo-oil",
        "guest-demo-milk",
        "guest-demo-yogurt",
        "guest-demo-eggs",
        "guest-demo-peas",
        "guest-demo-chicken",
      ]);

      const byId = Object.fromEntries(items.map((item) => [item.id, item]));

      expect(calculateExpiryStatus(byId["guest-demo-yogurt"].expiryDate, now)).toBe(
        "expired",
      );
      expect(calculateExpiryStatus(byId["guest-demo-milk"].expiryDate, now)).toBe(
        "warning",
      );
      expect(calculateExpiryStatus(byId["guest-demo-rice"].expiryDate, now)).toBe(
        "fresh",
      );
      expect(calculateExpiryStatus(byId["guest-demo-oil"].expiryDate, now)).toBe(
        "none",
      );

      expect(byId["guest-demo-yogurt"].expiryDate).toBe(isoDateOffset(-2, now));
      expect(byId["guest-demo-milk"].expiryDate).toBe(isoDateOffset(3, now));
      expect(byId["guest-demo-rice"].expiryDate).toBe(isoDateOffset(45, now));
      expect(byId["guest-demo-oil"].expiryDate).toBe("");

      expect(items.map((item) => item.category).sort()).toEqual(
        ["freezer", "freezer", "fridge", "fridge", "fridge", "pantry", "pantry", "pantry"].sort(),
      );
      expect(items.every((item) => item.createdAt === now.toISOString())).toBe(
        true,
      );
    });
  });

  describe("loadOrSeedGuestPantryItems", () => {
    it("seeds and writes sample items on first visit when the key is absent", () => {
      expect(localStorage.getItem(GUEST_PANTRY_STORAGE_KEY)).toBeNull();

      const items = loadOrSeedGuestPantryItems();

      expect(items).toHaveLength(8);
      expect(items[0]?.id).toBe("guest-demo-rice");
      expect(localStorage.getItem(GUEST_PANTRY_STORAGE_KEY)).not.toBeNull();
      expect(guestStorageHasDemoItems()).toBe(true);
    });

    it("does not overwrite an existing key", () => {
      const existing = [makeItem({ id: "guest-custom", name: "Beans" })];
      saveGuestPantryItems(existing);

      const items = loadOrSeedGuestPantryItems();

      expect(items).toEqual(existing);
      expect(guestStorageHasDemoItems()).toBe(false);
    });

    it("does not re-seed when the stored list is empty", () => {
      saveGuestPantryItems([]);

      const items = loadOrSeedGuestPantryItems();

      expect(items).toEqual([]);
      expect(JSON.parse(localStorage.getItem(GUEST_PANTRY_STORAGE_KEY)!)).toEqual({
        version: 1,
        items: [],
      });
      expect(guestStorageHasDemoItems()).toBe(false);
    });
  });

  describe("isGuestDemoItemId", () => {
    it("matches the stable demo id prefix", () => {
      expect(isGuestDemoItemId("guest-demo-rice")).toBe(true);
      expect(isGuestDemoItemId("guest-custom")).toBe(false);
    });
  });
});
