import type { PantryItemRow } from "@/lib/supabase/database.types";
import {
  pantryItemFromRow,
  pantryItemToRow,
  type PantryItem,
} from "./pantryItem";

describe("pantryItem mappers", () => {
  const row: PantryItemRow = {
    id: "11111111-1111-1111-1111-111111111111",
    user_id: "22222222-2222-2222-2222-222222222222",
    name: "Milk",
    quantity: 2,
    unit: "l",
    category: "fridge",
    expiry_date: "2026-10-01",
    created_at: "2026-09-17T12:00:00.000Z",
  };

  it("maps a database row to the app PantryItem shape", () => {
    expect(pantryItemFromRow(row)).toEqual({
      id: row.id,
      userId: row.user_id,
      name: "Milk",
      quantity: 2,
      unit: "l",
      category: "fridge",
      expiryDate: "2026-10-01",
      createdAt: "2026-09-17T12:00:00.000Z",
    });
  });

  it("maps null expiry_date to an empty expiryDate string", () => {
    expect(
      pantryItemFromRow({ ...row, expiry_date: null }).expiryDate,
    ).toBe("");
  });

  it("maps an app item back to a database row", () => {
    const item: PantryItem = {
      id: row.id,
      userId: row.user_id,
      name: "Milk",
      quantity: 2,
      unit: "l",
      category: "fridge",
      expiryDate: "2026-10-01",
      createdAt: "2026-09-17T12:00:00.000Z",
    };

    expect(pantryItemToRow(item)).toEqual(row);
  });

  it("maps empty expiryDate to null expiry_date", () => {
    const item: PantryItem = {
      id: row.id,
      userId: row.user_id,
      name: "Milk",
      quantity: 2,
      unit: "l",
      category: "fridge",
      expiryDate: "",
      createdAt: "2026-09-17T12:00:00.000Z",
    };

    expect(pantryItemToRow(item).expiry_date).toBeNull();
  });

  it("rejects mapping a local item without userId", () => {
    const item: PantryItem = {
      id: row.id,
      userId: null,
      name: "Milk",
      quantity: 2,
      unit: "l",
      category: "fridge",
      expiryDate: "2026-10-01",
      createdAt: "2026-09-17T12:00:00.000Z",
    };

    expect(() => pantryItemToRow(item)).toThrow(/userId/);
  });
});
