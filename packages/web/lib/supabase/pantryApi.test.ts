import type { PantryItemRow } from "./database.types";
import {
  deleteAllPantryItems,
  deletePantryItem,
  escapeIlikePattern,
  getAuthenticatedUserId,
  getErrorMessage,
  insertPantryItem,
  listPantryItems,
  PantryApiError,
  updatePantryItem,
  updatePantryItemQuantity,
} from "./pantryApi";

type QueryResult = {
  data: unknown;
  error: { message: string } | null;
  count?: number | null;
};

function createThenableBuilder(result: QueryResult) {
  const builder: {
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    eq: jest.Mock;
    ilike: jest.Mock;
    order: jest.Mock;
    range: jest.Mock;
    single: jest.Mock;
    then: (
      onFulfilled?: (value: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise<unknown>;
  } = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    ilike: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    single: jest.fn(),
    then: (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };

  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.ilike.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.range.mockReturnValue(builder);
  builder.single.mockReturnValue(builder);

  return builder;
}

describe("pantryApi", () => {
  it("getAuthenticatedUserId returns the signed-in user id", async () => {
    const supabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    };

    await expect(
      getAuthenticatedUserId(supabase as never),
    ).resolves.toBe("user-1");
  });

  it("getAuthenticatedUserId throws when there is no session", async () => {
    const supabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    };

    await expect(getAuthenticatedUserId(supabase as never)).rejects.toThrow(
      PantryApiError,
    );
  });

  it("escapeIlikePattern escapes wildcard characters", () => {
    expect(escapeIlikePattern("100%_off\\")).toBe("100\\%\\_off\\\\");
  });

  it("listPantryItems maps rows and applies query options", async () => {
    const row: PantryItemRow = {
      id: "item-1",
      user_id: "user-1",
      name: "Rice",
      quantity: 2,
      unit: "kg",
      category: "pantry",
      expiry_date: null,
      created_at: "2026-01-01T00:00:00.000Z",
    };

    const inventoryBuilder = createThenableBuilder({
      data: null,
      error: null,
      count: 5,
    });
    const filteredBuilder = createThenableBuilder({
      data: [row],
      error: null,
      count: 1,
    });

    const supabase = {
      from: jest
        .fn()
        .mockReturnValueOnce(inventoryBuilder)
        .mockReturnValueOnce(filteredBuilder),
    };

    const result = await listPantryItems(supabase as never, "user-1", {
      search: "ri",
      category: "pantry",
      sortBy: "quantity-desc",
      page: 1,
      pageSize: 6,
    });

    expect(supabase.from).toHaveBeenCalledWith("pantry_items");
    expect(filteredBuilder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(filteredBuilder.eq).toHaveBeenCalledWith("category", "pantry");
    expect(filteredBuilder.ilike).toHaveBeenCalledWith("name", "%ri%");
    expect(filteredBuilder.order).toHaveBeenCalledWith("quantity", {
      ascending: false,
    });
    expect(filteredBuilder.range).toHaveBeenCalledWith(0, 5);
    expect(result).toEqual({
      items: [
        {
          id: "item-1",
          userId: "user-1",
          name: "Rice",
          quantity: 2,
          unit: "kg",
          category: "pantry",
          expiryDate: "",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      totalCount: 1,
      inventoryTotal: 5,
      page: 1,
      pageSize: 6,
      totalPages: 1,
    });
  });

  it("listPantryItems clamps an out-of-range page and re-fetches", async () => {
    const row: PantryItemRow = {
      id: "item-7",
      user_id: "user-1",
      name: "Item 07",
      quantity: 7,
      unit: "units",
      category: "pantry",
      expiry_date: null,
      created_at: "2026-01-01T00:00:00.000Z",
    };

    const inventoryBuilder = createThenableBuilder({
      data: null,
      error: null,
      count: 7,
    });
    const emptyPageBuilder = createThenableBuilder({
      data: [],
      error: null,
      count: 7,
    });
    const lastPageBuilder = createThenableBuilder({
      data: [row],
      error: null,
    });

    const supabase = {
      from: jest
        .fn()
        .mockReturnValueOnce(inventoryBuilder)
        .mockReturnValueOnce(emptyPageBuilder)
        .mockReturnValueOnce(lastPageBuilder),
    };

    const result = await listPantryItems(supabase as never, "user-1", {
      page: 99,
      pageSize: 6,
      sortBy: "name-asc",
    });

    expect(emptyPageBuilder.range).toHaveBeenCalledWith(588, 593);
    expect(lastPageBuilder.range).toHaveBeenCalledWith(6, 11);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items[0]?.name).toBe("Item 07");
  });

  it("insertPantryItem returns the created item", async () => {
    const row: PantryItemRow = {
      id: "item-2",
      user_id: "user-1",
      name: "Milk",
      quantity: 1,
      unit: "units",
      category: "fridge",
      expiry_date: "2026-10-01",
      created_at: "2026-09-17T00:00:00.000Z",
    };

    const builder = createThenableBuilder({ data: row, error: null });
    const supabase = {
      from: jest.fn(() => builder),
    };

    const item = await insertPantryItem(supabase as never, "user-1", {
      name: "Milk",
      quantity: 1,
      unit: "units",
      category: "fridge",
      expiryDate: "2026-10-01",
    });

    expect(builder.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      name: "Milk",
      quantity: 1,
      unit: "units",
      category: "fridge",
      expiry_date: "2026-10-01",
    });
    expect(item.name).toBe("Milk");
    expect(item.userId).toBe("user-1");
  });

  it("updatePantryItem updates fields by id and returns the mapped item", async () => {
    const row: PantryItemRow = {
      id: "item-1",
      user_id: "user-1",
      name: "Almond milk",
      quantity: 2,
      unit: "l",
      category: "fridge",
      expiry_date: "2026-11-01",
      created_at: "2026-09-17T00:00:00.000Z",
    };

    const builder = createThenableBuilder({ data: row, error: null });
    const supabase = {
      from: jest.fn(() => builder),
    };

    const item = await updatePantryItem(supabase as never, "item-1", {
      name: "Almond milk",
      quantity: 2,
      unit: "l",
      category: "fridge",
      expiryDate: "2026-11-01",
    });

    expect(builder.update).toHaveBeenCalledWith({
      name: "Almond milk",
      quantity: 2,
      unit: "l",
      category: "fridge",
      expiry_date: "2026-11-01",
    });
    expect(builder.eq).toHaveBeenCalledWith("id", "item-1");
    expect(item).toEqual({
      id: "item-1",
      userId: "user-1",
      name: "Almond milk",
      quantity: 2,
      unit: "l",
      category: "fridge",
      expiryDate: "2026-11-01",
      createdAt: "2026-09-17T00:00:00.000Z",
    });
  });

  it("updatePantryItemQuantity updates by id", async () => {
    const builder = createThenableBuilder({ data: null, error: null });
    const supabase = {
      from: jest.fn(() => builder),
    };

    await updatePantryItemQuantity(supabase as never, "item-1", 4);

    expect(builder.update).toHaveBeenCalledWith({ quantity: 4 });
    expect(builder.eq).toHaveBeenCalledWith("id", "item-1");
  });

  it("deletePantryItem deletes by id", async () => {
    const builder = createThenableBuilder({ data: null, error: null });
    const supabase = {
      from: jest.fn(() => builder),
    };

    await deletePantryItem(supabase as never, "item-1");

    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", "item-1");
  });

  it("deleteAllPantryItems deletes by user id", async () => {
    const builder = createThenableBuilder({ data: null, error: null });
    const supabase = {
      from: jest.fn(() => builder),
    };

    await deleteAllPantryItems(supabase as never, "user-1");

    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("throws PantryApiError when list fails", async () => {
    const inventoryBuilder = createThenableBuilder({
      data: null,
      error: null,
      count: 0,
    });
    const filteredBuilder = createThenableBuilder({
      data: null,
      error: { message: "RLS blocked" },
    });
    const supabase = {
      from: jest
        .fn()
        .mockReturnValueOnce(inventoryBuilder)
        .mockReturnValueOnce(filteredBuilder),
    };

    await expect(listPantryItems(supabase as never, "user-1")).rejects.toThrow(
      "RLS blocked",
    );
  });

  it("getErrorMessage prefers Error messages", () => {
    expect(getErrorMessage(new Error("Boom"), "fallback")).toBe("Boom");
    expect(getErrorMessage("nope", "fallback")).toBe("fallback");
  });
});
