import { render, screen } from "@testing-library/react";
import { GuestModeBanner } from "./GuestModeBanner";
import { useLocaleStore } from "@/store/useLocaleStore";
import { usePantryStore } from "@/store/usePantryStore";
import {
  GUEST_PANTRY_STORAGE_KEY,
  saveGuestPantryItems,
} from "@/lib/guestPantryStorage";
import { createSampleGuestItems } from "@/lib/guestDemoPantry";
import type { PantryItem } from "@/lib/supabase/pantryItem";

function makeCustomItem(): PantryItem {
  return {
    id: "guest-custom-1",
    userId: null,
    name: "Bread",
    quantity: 1,
    unit: "units",
    category: "pantry",
    expiryDate: "",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("GuestModeBanner", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
    localStorage.clear();
    usePantryStore.setState({ inventoryTotal: 0 });
  });

  it("prompts guests to create an account", () => {
    render(<GuestModeBanner />);

    expect(screen.getByText("Guest mode")).toBeInTheDocument();
    expect(
      screen.getByText(/exploring locally/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create account to save/i }),
    ).toHaveAttribute("href", "/login?mode=signUp");
    expect(
      screen.queryByRole("link", { name: /^sign in$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/sample items for this demo/i),
    ).not.toBeInTheDocument();
  });

  it("explains sample demo items when they are still in guest storage", () => {
    saveGuestPantryItems(createSampleGuestItems(new Date(2026, 8, 19)));
    usePantryStore.setState({ inventoryTotal: 8 });

    render(<GuestModeBanner />);

    expect(
      screen.getByText(/sample items for this demo/i),
    ).toBeInTheDocument();
    expect(localStorage.getItem(GUEST_PANTRY_STORAGE_KEY)).not.toBeNull();
  });

  it("hides the sample hint when only custom guest items remain", () => {
    saveGuestPantryItems([makeCustomItem()]);
    usePantryStore.setState({ inventoryTotal: 1 });

    render(<GuestModeBanner />);

    expect(
      screen.queryByText(/sample items for this demo/i),
    ).not.toBeInTheDocument();
  });
});
