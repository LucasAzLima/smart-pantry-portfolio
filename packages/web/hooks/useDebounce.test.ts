import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("milk", 300));

    expect(result.current).toBe("milk");
  });

  it("updates to the latest value only after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delayMs }) => useDebounce(value, delayMs),
      { initialProps: { value: "m", delayMs: 300 } },
    );

    rerender({ value: "mi", delayMs: 300 });
    rerender({ value: "mil", delayMs: 300 });
    rerender({ value: "milk", delayMs: 300 });

    expect(result.current).toBe("m");

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe("m");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("milk");
  });

  it("resets the timer when the value changes again before the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "ab" });

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe("ab");
  });
});
