import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and responds to clicks", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Add item</Button>);

    const button = screen.getByRole("button", { name: "Add item" });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="outline" size="lg">
        Outline
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Outline" });
    expect(button.className).toContain("border");
    expect(button.className).toContain("h-12");
  });

  it("shows a loading spinner and blocks interaction when isLoading", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <Button isLoading onClick={handleClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg")).toBeInTheDocument();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
