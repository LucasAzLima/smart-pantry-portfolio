import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("renders a text input and accepts typing", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Input aria-label="Item name" onChange={handleChange} />);

    const input = screen.getByRole("textbox", { name: "Item name" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");

    await user.type(input, "Milk");
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue("Milk");
  });

  it("supports the number type", () => {
    render(<Input type="number" aria-label="Quantity" />);

    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveAttribute(
      "type",
      "number",
    );
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Input disabled aria-label="Item name" />);

    expect(screen.getByRole("textbox", { name: "Item name" })).toBeDisabled();
  });

  it("renders a date input and shows the selected value in the visible field", () => {
    render(
      <Input
        type="date"
        aria-label="Expiry date"
        value="2026-09-18"
        onChange={() => undefined}
      />,
    );

    const input = screen.getByLabelText("Expiry date");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveValue("2026-09-18");
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("shows a placeholder when the date value is empty", () => {
    render(
      <Input
        type="date"
        aria-label="Expiry date"
        value=""
        placeholder="Optional"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("shows an error message and marks the input invalid", () => {
    render(<Input error="Name is required" aria-label="Item name" />);

    const input = screen.getByRole("textbox", { name: "Item name" });
    const alert = screen.getByRole("alert");

    expect(alert).toHaveTextContent("Name is required");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
  });
});
