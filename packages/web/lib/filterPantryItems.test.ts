import type { PantryItem } from "@/store/usePantryStore";
import { filterPantryItems } from "./filterPantryItems";

const sampleItems: PantryItem[] = [
  {
    id: "1",
    name: "Olive oil",
    quantity: 1,
    unit: "l",
    category: "pantry",
    expiryDate: "2027-01-01",
  },
  {
    id: "2",
    name: "Milk",
    quantity: 2,
    unit: "l",
    category: "fridge",
    expiryDate: "2026-09-20",
  },
  {
    id: "3",
    name: "Frozen peas",
    quantity: 500,
    unit: "g",
    category: "freezer",
    expiryDate: "",
  },
  {
    id: "4",
    name: "Oat milk",
    quantity: 1,
    unit: "l",
    category: "fridge",
    expiryDate: "2026-10-01",
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
