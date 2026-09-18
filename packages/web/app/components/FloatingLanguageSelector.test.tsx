import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FloatingLanguageSelector,
  LanguageSelector,
} from "./FloatingLanguageSelector";
import { useLocaleStore } from "@/store/useLocaleStore";

describe("LanguageSelector", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
  });

  it("switches locale when a language button is pressed", async () => {
    const user = userEvent.setup();

    render(<LanguageSelector />);

    const group = screen.getByRole("group", { name: "Language" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "PT" }));

    expect(useLocaleStore.getState().locale).toBe("pt-BR");
    expect(screen.getByRole("button", { name: "PT" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the floating control hidden on small screens", () => {
    const { container } = render(<FloatingLanguageSelector />);

    expect(container.firstElementChild).toHaveClass("hidden", "sm:block");
  });
});
