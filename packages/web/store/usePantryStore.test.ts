import { act, renderHook } from "@testing-library/react";
import { usePantryStore } from "./usePantryStore";

describe("usePantryStore", () => {
  beforeEach(() => {
    act(() => {
      usePantryStore.getState().clearItems();
    });
  });

  it("adds trimmed items to the pantry", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem("  Milk  ");
      result.current.addItem("");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.name).toBe("Milk");
  });

  it("clears all items", () => {
    const { result } = renderHook(() => usePantryStore());

    act(() => {
      result.current.addItem("Eggs");
      result.current.clearItems();
    });

    expect(result.current.items).toHaveLength(0);
  });
});
