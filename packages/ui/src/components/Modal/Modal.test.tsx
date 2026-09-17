import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Hidden">
        Content
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title, content, and footer when open", () => {
    render(
      <Modal
        open
        onClose={jest.fn()}
        title="Edit item"
        footer={<button type="button">Save</button>}
      >
        Item details
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByRole("heading", { name: "Edit item" })).toBeInTheDocument();
    expect(within(dialog).getByText("Item details")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();

    render(
      <Modal open onClose={handleClose} title="Close me">
        Body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();

    render(
      <Modal open onClose={handleClose} title="Escape me">
        Body
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();

    const { container } = render(
      <Modal open onClose={handleClose} title="Backdrop">
        Body
      </Modal>,
    );

    const backdrop = container.firstChild;
    expect(backdrop).toBeTruthy();
    await user.click(backdrop as Element);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the dialog panel", async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();

    render(
      <Modal open onClose={handleClose} title="Panel">
        Body
      </Modal>,
    );

    await user.click(screen.getByText("Body"));
    expect(handleClose).not.toHaveBeenCalled();
  });
});
