"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalError from "./global-error";
import { useLocaleStore } from "@/store/useLocaleStore";

describe("GlobalError", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders recovery UI and calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    const error = Object.assign(new Error("root boom"), { digest: "xyz" });

    render(<GlobalError error={error} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
