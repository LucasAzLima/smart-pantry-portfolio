import { act, render, screen } from "@testing-library/react";
import { GuestModeGate } from "./GuestModeGate";
import { useLocaleStore } from "@/store/useLocaleStore";
import { usePantryStore } from "@/store/usePantryStore";

describe("GuestModeGate", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
    act(() => {
      usePantryStore.setState({
        userId: "user-1",
        isGuest: false,
        items: [
          {
            id: "item-1",
            userId: "user-1",
            name: "Milk",
            quantity: 1,
            unit: "units",
            category: "pantry",
            expiryDate: "",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        inventoryTotal: 1,
        totalCount: 1,
      });
    });
  });

  it("shows the guest banner when unauthenticated", () => {
    render(<GuestModeGate isAuthenticated={false} />);
    expect(screen.getByText("Guest mode")).toBeInTheDocument();
  });

  it("hides the banner when authenticated", () => {
    render(<GuestModeGate isAuthenticated />);
    expect(screen.queryByText("Guest mode")).not.toBeInTheDocument();
  });

  it("clears the cached auth user when entering guest mode", () => {
    render(<GuestModeGate isAuthenticated={false} />);

    expect(usePantryStore.getState().userId).toBeNull();
    expect(usePantryStore.getState().isGuest).toBe(true);
    expect(usePantryStore.getState().items).toEqual([]);
  });
});
