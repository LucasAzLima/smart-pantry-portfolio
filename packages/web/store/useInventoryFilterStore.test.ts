import type { CategoryFilter } from "@/lib/filterPantryItems";
import {
  DEFAULT_PANTRY_SORT,
  type PantrySortOption,
} from "@/lib/sortPantryItems";
import { useInventoryFilterStore } from "./useInventoryFilterStore";

describe("useInventoryFilterStore", () => {
  beforeEach(() => {
    useInventoryFilterStore.setState({
      category: "all",
      sortBy: DEFAULT_PANTRY_SORT,
    });
  });

  it("starts with all categories and alphabetical sort", () => {
    const state = useInventoryFilterStore.getState();
    expect(state.category).toBe("all");
    expect(state.sortBy).toBe("name-asc");
  });

  it("updates category and sort independently", () => {
    useInventoryFilterStore.getState().setCategory("fridge");
    useInventoryFilterStore.getState().setSortBy("expiry-asc");

    const state = useInventoryFilterStore.getState();
    expect(state.category).toBe("fridge");
    expect(state.sortBy).toBe("expiry-asc" satisfies PantrySortOption);
  });

  it("ignores invalid category and sort values", () => {
    useInventoryFilterStore.getState().setCategory("fridge");
    useInventoryFilterStore.getState().setSortBy("quantity-desc");

    useInventoryFilterStore.getState().setCategory(
      "attic" as CategoryFilter,
    );
    useInventoryFilterStore.getState().setSortBy(
      "name-desc" as PantrySortOption,
    );

    const state = useInventoryFilterStore.getState();
    expect(state.category).toBe("fridge");
    expect(state.sortBy).toBe("quantity-desc");
  });
});
