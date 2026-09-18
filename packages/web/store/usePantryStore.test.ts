import { act, renderHook, waitFor } from "@testing-library/react";
import type { PantryItem } from "@/lib/supabase/pantryItem";
import { DEFAULT_INVENTORY_PAGE_SIZE } from "@/lib/paginateItems";
import { DEFAULT_PANTRY_SORT } from "@/lib/sortPantryItems";
import { usePantryStore } from "./usePantryStore";

const mockCreateClient = jest.fn();
const mockGetAuthenticatedUserId = jest.fn();
const mockListPantryItems = jest.fn();
const mockInsertPantryItem = jest.fn();
const mockUpdatePantryItem = jest.fn();
const mockUpdatePantryItemQuantity = jest.fn();
const mockDeletePantryItem = jest.fn();
const mockDeleteAllPantryItems = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => mockCreateClient(),
}));

jest.mock("@/lib/supabase/pantryApi", () => ({
  getAuthenticatedUserId: (...args: unknown[]) =>
    mockGetAuthenticatedUserId(...args),
  listPantryItems: (...args: unknown[]) => mockListPantryItems(...args),
  insertPantryItem: (...args: unknown[]) => mockInsertPantryItem(...args),
  updatePantryItem: (...args: unknown[]) => mockUpdatePantryItem(...args),
  updatePantryItemQuantity: (...args: unknown[]) =>
    mockUpdatePantryItemQuantity(...args),
  deletePantryItem: (...args: unknown[]) => mockDeletePantryItem(...args),
  deleteAllPantryItems: (...args: unknown[]) =>
    mockDeleteAllPantryItems(...args),
  getErrorMessage: (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message.trim() !== "") {
      return error.message;
    }

    return fallback;
  },
}));

const supabaseStub = { from: jest.fn() };

function makeItem(overrides: Partial<PantryItem> = {}): PantryItem {
  return {
    id: "item-1",
    userId: "user-1",
    name: "Milk",
    quantity: 1,
    unit: "units",
    category: "pantry",
    expiryDate: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeListResult(
  items: PantryItem[],
  overrides: {
    totalCount?: number;
    inventoryTotal?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  } = {},
) {
  const totalCount = overrides.totalCount ?? items.length;
  const pageSize = overrides.pageSize ?? DEFAULT_INVENTORY_PAGE_SIZE;
  return {
    items,
    totalCount,
    inventoryTotal: overrides.inventoryTotal ?? totalCount,
    page: overrides.page ?? 1,
    pageSize,
    totalPages:
      overrides.totalPages ??
      (totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize)),
  };
}

describe("usePantryStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue(supabaseStub);
    mockGetAuthenticatedUserId.mockResolvedValue("user-1");

    act(() => {
      usePantryStore.setState({
        items: [],
        userId: null,
        totalCount: 0,
        inventoryTotal: 0,
        page: 1,
        pageSize: DEFAULT_INVENTORY_PAGE_SIZE,
        totalPages: 0,
        query: {
          search: "",
          category: "all",
          sortBy: DEFAULT_PANTRY_SORT,
          page: 1,
          pageSize: DEFAULT_INVENTORY_PAGE_SIZE,
        },
        status: "idle",
        error: null,
        isMutating: false,
      });
    });
  });

  it("loads items for the authenticated user with query params", async () => {
    const items = [makeItem({ name: "Eggs" })];
    mockListPantryItems.mockResolvedValue(makeListResult(items));

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.fetchItems({
        search: "egg",
        category: "fridge",
        sortBy: "quantity-desc",
        page: 2,
      });
    });

    expect(mockGetAuthenticatedUserId).toHaveBeenCalledWith(supabaseStub);
    expect(mockListPantryItems).toHaveBeenCalledWith(supabaseStub, "user-1", {
      search: "egg",
      category: "fridge",
      sortBy: "quantity-desc",
      page: 2,
      pageSize: DEFAULT_INVENTORY_PAGE_SIZE,
    });
    expect(result.current.items).toEqual(items);
    expect(result.current.userId).toBe("user-1");
    expect(result.current.totalCount).toBe(1);
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
  });

  it("reuses the cached user id on subsequent fetches", async () => {
    mockListPantryItems.mockResolvedValue(makeListResult([makeItem()]));

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.fetchItems();
    });

    await act(async () => {
      await result.current.fetchItems({ category: "fridge", page: 1 });
    });

    expect(mockGetAuthenticatedUserId).toHaveBeenCalledTimes(1);
    expect(mockListPantryItems).toHaveBeenCalledTimes(2);
    expect(result.current.userId).toBe("user-1");
  });

  it("stores a load error when fetch fails", async () => {
    mockListPantryItems.mockRejectedValue(new Error("Network down"));

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.fetchItems();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("Network down");
  });

  it("adds trimmed items with safe field defaults via Supabase", async () => {
    const created = makeItem({
      id: "created-1",
      name: "Milk",
      quantity: 1,
      unit: "units",
      category: "pantry",
      expiryDate: "",
    });
    mockInsertPantryItem.mockResolvedValue(created);
    mockListPantryItems.mockResolvedValue(makeListResult([created]));

    const { result } = renderHook(() => usePantryStore());

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.addItem({ name: "  Milk  " });
    });

    expect(succeeded).toBe(true);
    expect(mockInsertPantryItem).toHaveBeenCalledWith(supabaseStub, "user-1", {
      name: "Milk",
      quantity: 1,
      unit: "units",
      category: "pantry",
      expiryDate: "",
    });
    expect(result.current.items).toEqual([created]);
  });

  it("ignores empty names when adding", async () => {
    const { result } = renderHook(() => usePantryStore());

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.addItem({ name: "   " });
    });

    expect(succeeded).toBe(false);
    expect(mockInsertPantryItem).not.toHaveBeenCalled();
    expect(result.current.items).toHaveLength(0);
  });

  it("stores provided quantity, unit, category, and expiry date", async () => {
    const created = makeItem({
      name: "Olive oil",
      quantity: 0.5,
      unit: "l",
      category: "pantry",
      expiryDate: "2026-12-01",
    });
    mockInsertPantryItem.mockResolvedValue(created);
    mockListPantryItems.mockResolvedValue(makeListResult([created]));

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.addItem({
        name: "Olive oil",
        quantity: 0.5,
        unit: "l",
        category: "pantry",
        expiryDate: "2026-12-01",
      });
    });

    expect(mockInsertPantryItem).toHaveBeenCalledWith(supabaseStub, "user-1", {
      name: "Olive oil",
      quantity: 0.5,
      unit: "l",
      category: "pantry",
      expiryDate: "2026-12-01",
    });
  });

  it("falls back to defaults for invalid quantity and enums", async () => {
    mockInsertPantryItem.mockResolvedValue(makeItem({ name: "Eggs" }));
    mockListPantryItems.mockResolvedValue(
      makeListResult([makeItem({ name: "Eggs" })]),
    );

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.addItem({
        name: "Eggs",
        quantity: -2,
        unit: "boxes" as PantryItem["unit"],
        category: "garage" as PantryItem["category"],
        expiryDate: "  2026-01-15  ",
      });
    });

    expect(mockInsertPantryItem).toHaveBeenCalledWith(supabaseStub, "user-1", {
      name: "Eggs",
      quantity: 1,
      unit: "units",
      category: "pantry",
      expiryDate: "2026-01-15",
    });
  });

  it("removes a single item by id and reloads the current query", async () => {
    const first = makeItem({ id: "a", name: "Milk" });
    const second = makeItem({ id: "b", name: "Eggs" });
    mockDeletePantryItem.mockResolvedValue(undefined);
    mockListPantryItems.mockResolvedValue(makeListResult([second]));

    act(() => {
      usePantryStore.setState({
        items: [first, second],
        totalCount: 2,
        inventoryTotal: 2,
      });
    });

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.removeItem("a");
    });

    expect(mockDeletePantryItem).toHaveBeenCalledWith(supabaseStub, "a");
    expect(mockListPantryItems).toHaveBeenCalled();
    expect(result.current.items).toEqual([second]);
  });

  it("rolls back removeItem when the API fails", async () => {
    const item = makeItem();
    mockDeletePantryItem.mockRejectedValue(new Error("Delete failed"));

    act(() => {
      usePantryStore.setState({
        items: [item],
        totalCount: 1,
        inventoryTotal: 1,
      });
    });

    const { result } = renderHook(() => usePantryStore());

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.removeItem(item.id);
    });

    expect(succeeded).toBe(false);
    expect(result.current.items).toEqual([item]);
    expect(result.current.error).toBe("Delete failed");
  });

  it("updates an item and reloads the current query", async () => {
    const item = makeItem({
      name: "Milk",
      quantity: 1,
      unit: "units",
      category: "fridge",
      expiryDate: "2026-10-01",
    });
    const updated = makeItem({
      ...item,
      name: "Almond milk",
      quantity: 2,
      unit: "l",
      category: "pantry",
      expiryDate: "2026-11-01",
    });
    mockUpdatePantryItem.mockResolvedValue(updated);
    mockListPantryItems.mockResolvedValue(makeListResult([updated]));

    act(() => {
      usePantryStore.setState({ items: [item], totalCount: 1, inventoryTotal: 1 });
    });

    const { result } = renderHook(() => usePantryStore());

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.updateItem(item.id, {
        name: "  Almond milk  ",
        quantity: 2,
        unit: "l",
        category: "pantry",
        expiryDate: "2026-11-01",
      });
    });

    expect(succeeded).toBe(true);
    expect(mockUpdatePantryItem).toHaveBeenCalledWith(supabaseStub, item.id, {
      name: "Almond milk",
      quantity: 2,
      unit: "l",
      category: "pantry",
      expiryDate: "2026-11-01",
    });
    expect(result.current.items).toEqual([updated]);
  });

  it("ignores empty names when updating", async () => {
    const item = makeItem();

    act(() => {
      usePantryStore.setState({ items: [item] });
    });

    const { result } = renderHook(() => usePantryStore());

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.updateItem(item.id, { name: "   " });
    });

    expect(succeeded).toBe(false);
    expect(mockUpdatePantryItem).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([item]);
  });

  it("rolls back updateItem when the API fails", async () => {
    const item = makeItem({ name: "Milk" });
    mockUpdatePantryItem.mockRejectedValue(new Error("Update failed"));

    act(() => {
      usePantryStore.setState({ items: [item] });
    });

    const { result } = renderHook(() => usePantryStore());

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.updateItem(item.id, {
        name: "Almond milk",
        quantity: 3,
        unit: "l",
        category: "fridge",
        expiryDate: "2026-12-01",
      });
    });

    expect(succeeded).toBe(false);
    expect(result.current.items).toEqual([item]);
    expect(result.current.error).toBe("Update failed");
  });

  it("updates item quantity optimistically", async () => {
    const item = makeItem({ quantity: 2 });
    mockUpdatePantryItemQuantity.mockResolvedValue(undefined);

    act(() => {
      usePantryStore.setState({ items: [item] });
    });

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.updateItemQuantity(item.id, 5);
    });

    expect(mockUpdatePantryItemQuantity).toHaveBeenCalledWith(
      supabaseStub,
      item.id,
      5,
    );
    expect(result.current.items[0].quantity).toBe(5);
  });

  it("ignores non-positive or invalid quantity updates", async () => {
    const item = makeItem({ quantity: 3 });

    act(() => {
      usePantryStore.setState({ items: [item] });
    });

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.updateItemQuantity(item.id, 0);
      await result.current.updateItemQuantity(item.id, -1);
      await result.current.updateItemQuantity(item.id, Number.NaN);
    });

    expect(mockUpdatePantryItemQuantity).not.toHaveBeenCalled();
    expect(result.current.items[0].quantity).toBe(3);
  });

  it("clears all items for the authenticated user", async () => {
    mockDeleteAllPantryItems.mockResolvedValue(undefined);

    act(() => {
      usePantryStore.setState({
        items: [makeItem({ id: "a" }), makeItem({ id: "b", name: "Eggs" })],
        inventoryTotal: 2,
        totalCount: 2,
      });
    });

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.clearItems();
    });

    expect(mockDeleteAllPantryItems).toHaveBeenCalledWith(supabaseStub, "user-1");
    expect(result.current.items).toHaveLength(0);
    expect(result.current.inventoryTotal).toBe(0);
  });

  it("rolls back clearItems when the API fails", async () => {
    const items = [makeItem()];
    mockDeleteAllPantryItems.mockRejectedValue(new Error("Clear failed"));

    act(() => {
      usePantryStore.setState({
        items,
        inventoryTotal: 1,
        totalCount: 1,
      });
    });

    const { result } = renderHook(() => usePantryStore());

    await act(async () => {
      await result.current.clearItems();
    });

    await waitFor(() => {
      expect(result.current.items).toEqual(items);
    });
    expect(result.current.error).toBe("Clear failed");
  });
});
