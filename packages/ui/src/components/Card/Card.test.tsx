import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Olive oil</Card>);

    expect(screen.getByText("Olive oil")).toBeInTheDocument();
  });

  it("applies padding classes", () => {
    const { container } = render(<Card padding="lg">Spacious</Card>);

    expect(container.firstChild).toHaveClass("p-6");
  });

  it("applies interactive hover classes when interactive", () => {
    const { container } = render(<Card interactive>Clickable</Card>);

    expect(container.firstChild).toHaveClass("cursor-pointer");
    expect(container.firstChild).toHaveClass("hover:bg-zinc-50");
  });
});
