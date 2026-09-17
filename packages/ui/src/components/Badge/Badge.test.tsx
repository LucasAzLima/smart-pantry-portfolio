import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Fresh</Badge>);

    expect(screen.getByText("Fresh")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<Badge variant="danger">Expired</Badge>);

    expect(screen.getByText("Expired").className).toContain("bg-red-100");
  });

  it("defaults to the neutral variant", () => {
    render(<Badge>Pantry</Badge>);

    expect(screen.getByText("Pantry").className).toContain("bg-zinc-100");
  });
});
