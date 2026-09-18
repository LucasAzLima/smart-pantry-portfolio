import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PantryDemo } from "./PantryDemo";
import {
  getOptionalAuthenticatedUserId,
  listPantryItems,
  updatePantryItem,
} from "@/lib/supabase/pantryApi";
import type { ListPantryItemsResult } from "@/lib/supabase/pantryApi";
import type { PantryItem } from "@/lib/supabase/pantryItem";
import { DEFAULT_INVENTORY_PAGE_SIZE } from "@/lib/paginateItems";
import { useInventoryFilterStore } from "@/store/useInventoryFilterStore";
import { useLocaleStore } from "@/store/useLocaleStore";
import { usePantryStore } from "@/store/usePantryStore";
import { DEFAULT_PANTRY_SORT } from "@/lib/sortPantryItems";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({})),
}));

jest.mock("@/lib/supabase/pantryApi", () => ({
  getOptionalAuthenticatedUserId: jest.fn(),
  listPantryItems: jest.fn(),
  insertPantryItem: jest.fn(),
  insertPantryItems: jest.fn(),
  updatePantryItem: jest.fn(),
  updatePantryItemQuantity: jest.fn(),
  deletePantryItem: jest.fn(),
  deleteAllPantryItems: jest.fn(),
  getErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error && error.message.trim() !== ""
      ? error.message
      : fallback,
}));

const mockedGetOptionalAuthenticatedUserId = jest.mocked(
  getOptionalAuthenticatedUserId,
);
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

function makeListResult(
  items: PantryItem[],
  overrides: Partial<ListPantryItemsResult> = {},
): ListPantryItemsResult {
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

describe("PantryDemo", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockedGetOptionalAuthenticatedUserId.mockResolvedValue("user-1");
    mockedListPantryItems.mockResolvedValue(makeListResult([]));

    act(() => {
      usePantryStore.setState({
        items: [],
        userId: null,
        isGuest: false,
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
        isMigratingGuest: false,
      });
      useInventoryFilterStore.setState({
        category: "all",
        sortBy: DEFAULT_PANTRY_SORT,
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

    mockedListPantryItems.mockResolvedValue(makeListResult([]));

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

    mockedListPantryItems.mockResolvedValue(makeListResult([item]));
    mockedUpdatePantryItem.mockResolvedValue(updated);

    render(<PantryDemo />);

    await waitFor(() => {
      expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    mockedListPantryItems.mockResolvedValue(makeListResult([updated]));

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

  it("requests a new sort from the server when the sort control changes", async () => {
    const user = userEvent.setup();
    const nameSorted = [
      makeItem({ id: "b", name: "Apples", quantity: 5, expiryDate: "2026-09-25" }),
      makeItem({ id: "c", name: "Bread", quantity: 2, expiryDate: "" }),
      makeItem({
        id: "a",
        name: "Zucchini",
        quantity: 1,
        expiryDate: "2026-12-01",
      }),
    ];
    const expirySorted = [
      makeItem({ id: "b", name: "Apples", quantity: 5, expiryDate: "2026-09-25" }),
      makeItem({
        id: "a",
        name: "Zucchini",
        quantity: 1,
        expiryDate: "2026-12-01",
      }),
      makeItem({ id: "c", name: "Bread", quantity: 2, expiryDate: "" }),
    ];
    const quantitySorted = [
      makeItem({ id: "b", name: "Apples", quantity: 5, expiryDate: "2026-09-25" }),
      makeItem({ id: "c", name: "Bread", quantity: 2, expiryDate: "" }),
      makeItem({
        id: "a",
        name: "Zucchini",
        quantity: 1,
        expiryDate: "2026-12-01",
      }),
    ];

    mockedListPantryItems.mockImplementation(async (_client, _userId, query) => {
      if (query?.sortBy === "expiry-asc") {
        return makeListResult(expirySorted);
      }
      if (query?.sortBy === "quantity-desc") {
        return makeListResult(quantitySorted);
      }
      return makeListResult(nameSorted);
    });

    render(<PantryDemo />);

    await waitFor(() => {
      expect(screen.getByText("Zucchini")).toBeInTheDocument();
    });

    const list = screen.getByRole("list", { name: "Pantry items" });
    const names = () =>
      within(list)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent);

    expect(names()).toEqual(["Apples", "Bread", "Zucchini"]);

    await user.selectOptions(screen.getByLabelText("Sort by"), "expiry-asc");

    await waitFor(() => {
      expect(names()).toEqual(["Apples", "Zucchini", "Bread"]);
    });
    expect(mockedListPantryItems).toHaveBeenCalledWith(
      expect.anything(),
      "user-1",
      expect.objectContaining({ sortBy: "expiry-asc", page: 1 }),
    );

    await user.selectOptions(
      screen.getByLabelText("Sort by"),
      "quantity-desc",
    );

    await waitFor(() => {
      expect(names()).toEqual(["Apples", "Bread", "Zucchini"]);
    });
    expect(mockedListPantryItems).toHaveBeenCalledWith(
      expect.anything(),
      "user-1",
      expect.objectContaining({ sortBy: "quantity-desc", page: 1 }),
    );
  });

  it("paginates the inventory list through server-side page requests", async () => {
    const user = userEvent.setup();
    const pageOne = Array.from({ length: 6 }, (_, index) =>
      makeItem({
        id: `item-${index + 1}`,
        name: `Item ${String(index + 1).padStart(2, "0")}`,
        quantity: index + 1,
      }),
    );
    const pageTwo = [
      makeItem({
        id: "item-7",
        name: "Item 07",
        quantity: 7,
      }),
    ];

    mockedListPantryItems.mockImplementation(async (_client, _userId, query) => {
      if (query?.page === 2) {
        return makeListResult(pageTwo, {
          totalCount: 7,
          inventoryTotal: 7,
          page: 2,
          totalPages: 2,
        });
      }

      return makeListResult(pageOne, {
        totalCount: 7,
        inventoryTotal: 7,
        page: 1,
        totalPages: 2,
      });
    });

    render(<PantryDemo />);

    await waitFor(() => {
      expect(screen.getByText("Item 01")).toBeInTheDocument();
    });

    const list = screen.getByRole("list", { name: "Pantry items" });
    expect(within(list).getAllByRole("heading", { level: 3 })).toHaveLength(6);
    expect(screen.queryByText("Item 07")).not.toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    });
    expect(screen.getByText("Item 07")).toBeInTheDocument();
    expect(screen.queryByText("Item 01")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(mockedListPantryItems).toHaveBeenCalledWith(
      expect.anything(),
      "user-1",
      expect.objectContaining({ page: 2 }),
    );
  });
});
