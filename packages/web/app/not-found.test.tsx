import { render, screen } from "@testing-library/react";
import NotFoundPage from "./not-found";
import { useLocaleStore } from "@/store/useLocaleStore";

describe("NotFoundPage", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
  });

  it("renders the 404 message with links home and to login", () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("That page does not exist or may have moved."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
