import type { PantryItem } from "@/store/usePantryStore";
import { filterPantryItems } from "./filterPantryItems";

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

describe("filterPantryItems", () => {
  it("returns all items when query is empty and category is all", () => {
    expect(
      filterPantryItems(sampleItems, { query: "", category: "all" }),
    ).toHaveLength(4);
  });

  it("filters by category", () => {
    const result = filterPantryItems(sampleItems, {
      query: "",
      category: "fridge",
    });

    expect(result.map((item) => item.id)).toEqual(["2", "4"]);
  });

  it("filters by name case-insensitively", () => {
    const result = filterPantryItems(sampleItems, {
      query: "  MILK  ",
      category: "all",
    });

    expect(result.map((item) => item.name)).toEqual(["Milk", "Oat milk"]);
  });

  it("combines search and category filters", () => {
    const result = filterPantryItems(sampleItems, {
      query: "milk",
      category: "fridge",
    });

    expect(result.map((item) => item.id)).toEqual(["2", "4"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(
      filterPantryItems(sampleItems, {
        query: "butter",
        category: "freezer",
      }),
    ).toEqual([]);
  });
});
