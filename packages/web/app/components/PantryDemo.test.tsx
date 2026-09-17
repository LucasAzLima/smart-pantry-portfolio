import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PantryDemo } from "./PantryDemo";
import {
  getAuthenticatedUserId,
  listPantryItems,
} from "@/lib/supabase/pantryApi";
import { useLocaleStore } from "@/store/useLocaleStore";
import { usePantryStore } from "@/store/usePantryStore";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({})),
}));

jest.mock("@/lib/supabase/pantryApi", () => ({
  getAuthenticatedUserId: jest.fn(),
  listPantryItems: jest.fn(),
  insertPantryItem: jest.fn(),
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
});
