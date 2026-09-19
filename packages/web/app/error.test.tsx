import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorPage from "./error";
import { useLocaleStore } from "@/store/useLocaleStore";

describe("ErrorPage", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the error message and calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    const error = Object.assign(new Error("boom"), { digest: "abc" });

    render(<ErrorPage error={error} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "An unexpected error occurred. You can try again or return home.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      "/",
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
