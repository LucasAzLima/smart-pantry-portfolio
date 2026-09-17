import { act, renderHook } from "@testing-library/react";
import { PANTRY_STORAGE_KEY, usePantryStore } from "./usePantryStore";

interface PersistedStorageValue {
  state: {
    items: Array<{ id: string; name: string }>;
  };
  version?: number;
}

function readPersistedItems(): Array<{ id: string; name: string }> {
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

  it("adds trimmed items to the pantry", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem("  Milk  ");
      result.current.addItem("");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.name).toBe("Milk");
  });

  it("clears all items", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem("Eggs");
      result.current.clearItems();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("writes items to localStorage", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem("Olive oil");
    });

    const persisted = readPersistedItems();
    expect(persisted).toHaveLength(1);
    expect(persisted[0]?.name).toBe("Olive oil");
  });

  it("clears persisted items from localStorage", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem("Eggs");
      result.current.clearItems();
    });

    expect(readPersistedItems()).toEqual([]);
  });

  it("rehydrates items from localStorage", async () => {
    const persisted: PersistedStorageValue = {
      state: {
        items: [{ id: "item-1", name: "Rice" }],
      },
      version: 0,
    };
    localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(persisted));

    await act(async () => {
      await usePantryStore.persist.rehydrate();
    });

    expect(usePantryStore.getState().items).toEqual([
      { id: "item-1", name: "Rice" },
    ]);
  });
});
