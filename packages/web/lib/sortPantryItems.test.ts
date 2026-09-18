import type { PantryItem } from "@/store/usePantryStore";
import {
  DEFAULT_PANTRY_SORT,
  isPantrySortOption,
  sortPantryItems,
  type PantrySortOption,
} from "./sortPantryItems";

const sampleItems: PantryItem[] = [
  {
    id: "1",
    userId: null,
    name: "Olive oil",
    quantity: 1,
    unit: "l",
    category: "pantry",
    expiryDate: "2027-01-01",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    userId: null,
    name: "Milk",
    quantity: 2,
    unit: "l",
    category: "fridge",
    expiryDate: "2026-09-20",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    userId: null,
    name: "Frozen peas",
    quantity: 500,
    unit: "g",
    category: "freezer",
    expiryDate: "",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    userId: null,
    name: "Oat milk",
    quantity: 1,
    unit: "l",
    category: "fridge",
    expiryDate: "2026-10-01",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("isPantrySortOption", () => {
  it("accepts known options and rejects unknown values", () => {
    expect(isPantrySortOption("name-asc")).toBe(true);
    expect(isPantrySortOption("expiry-asc")).toBe(true);
    expect(isPantrySortOption("quantity-desc")).toBe(true);
    expect(isPantrySortOption("name-desc")).toBe(false);
    expect(isPantrySortOption("")).toBe(false);
  });
});

describe("sortPantryItems", () => {
  it("defaults to alphabetical ascending", () => {
    expect(DEFAULT_PANTRY_SORT).toBe("name-asc");

    const result = sortPantryItems(sampleItems, "name-asc");
    expect(result.map((item) => item.name)).toEqual([
      "Frozen peas",
      "Milk",
      "Oat milk",
      "Olive oil",
    ]);
  });

  it("sorts by expiry proximity with missing dates last", () => {
    const result = sortPantryItems(sampleItems, "expiry-asc");
    expect(result.map((item) => item.id)).toEqual(["2", "4", "1", "3"]);
  });

  it("sorts by quantity descending with name tie-break", () => {
    const result = sortPantryItems(sampleItems, "quantity-desc");
    expect(result.map((item) => item.id)).toEqual(["3", "2", "4", "1"]);
  });

  it("does not mutate the input array", () => {
    const originalOrder = sampleItems.map((item) => item.id);
    sortPantryItems(sampleItems, "name-asc" satisfies PantrySortOption);
    expect(sampleItems.map((item) => item.id)).toEqual(originalOrder);
  });
});
