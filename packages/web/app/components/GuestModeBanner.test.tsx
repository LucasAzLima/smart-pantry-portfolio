import { render, screen } from "@testing-library/react";
import { GuestModeBanner } from "./GuestModeBanner";
import { useLocaleStore } from "@/store/useLocaleStore";

describe("GuestModeBanner", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
  });

  it("prompts guests to create an account", () => {
    render(<GuestModeBanner />);

    expect(screen.getByText("Guest mode")).toBeInTheDocument();
    expect(
      screen.getByText(/exploring locally/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create account to save/i }),
    ).toHaveAttribute("href", "/login");
    expect(
      screen.queryByRole("link", { name: /^sign in$/i }),
    ).not.toBeInTheDocument();
  });
});
