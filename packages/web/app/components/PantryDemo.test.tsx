import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PantryDemo } from "./PantryDemo";
import {
  getAuthenticatedUserId,
  listPantryItems,
  updatePantryItem,
} from "@/lib/supabase/pantryApi";
import type { PantryItem } from "@/lib/supabase/pantryItem";
import { useLocaleStore } from "@/store/useLocaleStore";
import { usePantryStore } from "@/store/usePantryStore";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({})),
}));

jest.mock("@/lib/supabase/pantryApi", () => ({
  getAuthenticatedUserId: jest.fn(),
  listPantryItems: jest.fn(),
  insertPantryItem: jest.fn(),
  updatePantryItem: jest.fn(),
  updatePantryItemQuantity: jest.fn(),
  deletePantryItem: jest.fn(),
  deleteAllPantryItems: jest.fn(),
  getErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error && error.message.trim() !== ""
      ? error.message
      : fallback,
}));

const mockedGetAuthenticatedUserId = jest.mocked(getAuthenticatedUserId);
const mockedListPantryItems = jest.mocked(listPantryItems);
const mockedUpdatePantryItem = jest.mocked(updatePantryItem);

function makeItem(overrides: Partial<PantryItem> = {}): PantryItem {
  return {
    id: "item-1",
    userId: "user-1",
    name: "Milk",
    quantity: 2,
    unit: "l",
    category: "fridge",
    expiryDate: "2026-10-01",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("PantryDemo", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockedGetAuthenticatedUserId.mockResolvedValue("user-1");
    mockedListPantryItems.mockResolvedValue([]);

    act(() => {
      usePantryStore.setState({
        items: [],
        status: "idle",
        error: null,
        isMutating: false,
      });
      useLocaleStore.setState({ locale: "en-US" });
      useLocaleStore.persist.clearStorage();
    });
  });

  it("shows a single add-item action when the pantry is empty", async () => {
    render(<PantryDemo />);

    await waitFor(() => {
      expect(
        screen.getByText("No items yet. Add something to your pantry."),
      ).toBeInTheDocument();
    });

    expect(
      screen.getAllByRole("button", { name: "Add new item" }),
    ).toHaveLength(1);
  });

  it("shows a loading state while inventory is fetching", () => {
    mockedListPantryItems.mockImplementation(
      () => new Promise(() => undefined),
    );

    render(<PantryDemo />);

    expect(screen.getByText("Loading your pantry…")).toBeInTheDocument();
  });

  it("shows a retry action when inventory fails to load", async () => {
    const user = userEvent.setup();
    mockedListPantryItems.mockRejectedValue(new Error("Failed"));

    render(<PantryDemo />);

    await waitFor(() => {
      expect(
        screen.getByText("We could not load your pantry."),
      ).toBeInTheDocument();
    });

    mockedListPantryItems.mockResolvedValue([]);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(
        screen.getByText("No items yet. Add something to your pantry."),
      ).toBeInTheDocument();
    });
  });

  it("opens the edit modal with the item fields and saves updates to the card", async () => {
    const user = userEvent.setup();
    const item = makeItem();
    const updated = makeItem({
      name: "Almond milk",
      quantity: 3,
      unit: "l",
      category: "fridge",
      expiryDate: "2026-11-01",
    });

    mockedListPantryItems.mockResolvedValue([item]);
    mockedUpdatePantryItem.mockResolvedValue(updated);

    render(<PantryDemo />);

    await waitFor(() => {
      expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Edit Milk" }));

    const dialog = screen.getByRole("dialog", { name: "Edit item" });
    expect(within(dialog).getByLabelText("Item name")).toHaveValue("Milk");
    expect(within(dialog).getByLabelText("Quantity")).toHaveValue(2);
    expect(within(dialog).getByLabelText("Unit")).toHaveValue("l");
    expect(within(dialog).getByLabelText("Category")).toHaveValue("fridge");
    expect(within(dialog).getByLabelText("Expiry date")).toHaveValue(
      "2026-10-01",
    );

    await user.clear(within(dialog).getByLabelText("Item name"));
    await user.type(within(dialog).getByLabelText("Item name"), "Almond milk");
    await user.clear(within(dialog).getByLabelText("Quantity"));
    await user.type(within(dialog).getByLabelText("Quantity"), "3");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Edit item" }),
      ).not.toBeInTheDocument();
    });

    expect(mockedUpdatePantryItem).toHaveBeenCalledWith(
      expect.anything(),
      item.id,
      {
        name: "Almond milk",
        quantity: 3,
        unit: "l",
        category: "fridge",
        expiryDate: "2026-10-01",
      },
    );
    expect(screen.getByText("Almond milk")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
  });
});
