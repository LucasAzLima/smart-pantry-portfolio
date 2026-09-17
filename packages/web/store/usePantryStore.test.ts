import { act, renderHook } from "@testing-library/react";
import {
  PANTRY_STORAGE_KEY,
  type PantryItem,
  usePantryStore,
} from "./usePantryStore";

interface PersistedStorageValue {
  state: {
    items: PantryItem[];
  };
  version?: number;
}

function readPersistedItems(): PantryItem[] {
  const raw = localStorage.getItem(PANTRY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as PersistedStorageValue;
  return parsed.state.items;
}

describe("usePantryStore", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      usePantryStore.setState({ items: [] });
      usePantryStore.persist.clearStorage();
    });
  });

  it("adds trimmed items with safe field defaults", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({ name: "  Milk  " });
      result.current.addItem({ name: "" });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      name: "Milk",
      quantity: 1,
      unit: "units",
      category: "pantry",
      expiryDate: "",
    });
  });

  it("stores provided quantity, unit, category, and expiry date", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({
        name: "Olive oil",
        quantity: 0.5,
        unit: "l",
        category: "pantry",
        expiryDate: "2026-12-01",
      });
    });

    expect(result.current.items[0]).toMatchObject({
      name: "Olive oil",
      quantity: 0.5,
      unit: "l",
      category: "pantry",
      expiryDate: "2026-12-01",
    });
  });

  it("falls back to defaults for invalid quantity and enums", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({
        name: "Eggs",
        quantity: -2,
        unit: "boxes" as PantryItem["unit"],
        category: "garage" as PantryItem["category"],
        expiryDate: "  2026-01-15  ",
      });
    });

    expect(result.current.items[0]).toMatchObject({
      name: "Eggs",
      quantity: 1,
      unit: "units",
      category: "pantry",
      expiryDate: "2026-01-15",
    });
  });

  it("clears all items", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({ name: "Eggs" });
      result.current.clearItems();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("removes a single item by id", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({ name: "Milk" });
      result.current.addItem({ name: "Eggs" });
    });

    const [firstItem, secondItem] = result.current.items;

    act(() => {
      result.current.removeItem(firstItem.id);
    });

    expect(result.current.items).toEqual([secondItem]);
  });

  it("ignores removeItem for unknown ids", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({ name: "Milk" });
    });

    const before = result.current.items;

    act(() => {
      result.current.removeItem("missing-id");
    });

    expect(result.current.items).toEqual(before);
  });

  it("updates item quantity immutably", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({ name: "Rice", quantity: 2 });
    });

    const itemId = result.current.items[0].id;
    const previousItem = result.current.items[0];

    act(() => {
      result.current.updateItemQuantity(itemId, 5);
    });

    expect(result.current.items[0]).toMatchObject({
      id: itemId,
      name: "Rice",
      quantity: 5,
    });
    expect(result.current.items[0]).not.toBe(previousItem);
  });

  it("ignores non-positive or invalid quantity updates", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({ name: "Flour", quantity: 3 });
    });

    const itemId = result.current.items[0].id;

    act(() => {
      result.current.updateItemQuantity(itemId, 0);
      result.current.updateItemQuantity(itemId, -1);
      result.current.updateItemQuantity(itemId, Number.NaN);
    });

    expect(result.current.items[0].quantity).toBe(3);
  });

  it("writes items to localStorage", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({
        name: "Olive oil",
        quantity: 2,
        unit: "units",
        category: "fridge",
        expiryDate: "2026-10-01",
      });
    });

    const persisted = readPersistedItems();
    expect(persisted).toHaveLength(1);
    expect(persisted[0]).toMatchObject({
      name: "Olive oil",
      quantity: 2,
      unit: "units",
      category: "fridge",
      expiryDate: "2026-10-01",
    });
  });

  it("clears persisted items from localStorage", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem({ name: "Eggs" });
      result.current.clearItems();
    });

    expect(readPersistedItems()).toEqual([]);
  });

  it("rehydrates items from localStorage", async () => {
    const persisted: PersistedStorageValue = {
      state: {
        items: [
          {
            id: "item-1",
            name: "Rice",
            quantity: 1,
            unit: "kg",
            category: "pantry",
            expiryDate: "2027-01-01",
          },
        ],
      },
      version: 1,
    };
    localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(persisted));

    await act(async () => {
      await usePantryStore.persist.rehydrate();
    });

    expect(usePantryStore.getState().items).toEqual([
      {
        id: "item-1",
        name: "Rice",
        quantity: 1,
        unit: "kg",
        category: "pantry",
        expiryDate: "2027-01-01",
      },
    ]);
  });

  it("migrates legacy persisted items into the expanded shape", async () => {
    localStorage.setItem(
      PANTRY_STORAGE_KEY,
      JSON.stringify({
        state: {
          items: [{ id: "legacy-1", name: "Butter" }],
        },
        version: 0,
      }),
    );

    await act(async () => {
      await usePantryStore.persist.rehydrate();
    });

    expect(usePantryStore.getState().items).toEqual([
      {
        id: "legacy-1",
        name: "Butter",
        quantity: 1,
        unit: "units",
        category: "pantry",
        expiryDate: "",
      },
    ]);
  });
});
