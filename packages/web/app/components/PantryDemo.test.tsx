import { act, render, screen } from "@testing-library/react";
import { PantryDemo } from "./PantryDemo";
import { useLocaleStore } from "@/store/useLocaleStore";
import { usePantryStore } from "@/store/usePantryStore";

describe("PantryDemo", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      usePantryStore.setState({ items: [] });
      usePantryStore.persist.clearStorage();
      useLocaleStore.setState({ locale: "en-US" });
      useLocaleStore.persist.clearStorage();
    });
  });

  it("shows a single add-item action when the pantry is empty", () => {
    render(<PantryDemo />);

    expect(
      screen.getByText("No items yet. Add something to your pantry."),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Add new item" }),
    ).toHaveLength(1);
  });
});
