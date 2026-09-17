import type { PantryItemRow } from "./database.types";
import {
  deleteAllPantryItems,
  deletePantryItem,
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
};

function createThenableBuilder(result: QueryResult) {
  const builder: {
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    eq: jest.Mock;
    order: jest.Mock;
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
    order: jest.fn(),
    single: jest.fn(),
    then: (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };

  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
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

  it("listPantryItems maps rows for the user", async () => {
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

    const builder = createThenableBuilder({ data: [row], error: null });
    const supabase = {
      from: jest.fn(() => builder),
    };

    const items = await listPantryItems(supabase as never, "user-1");

    expect(supabase.from).toHaveBeenCalledWith("pantry_items");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(items).toEqual([
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
    ]);
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
    const builder = createThenableBuilder({
      data: null,
      error: { message: "RLS blocked" },
    });
    const supabase = {
      from: jest.fn(() => builder),
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
