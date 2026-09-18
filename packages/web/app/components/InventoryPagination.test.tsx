import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryPagination } from "./InventoryPagination";
import { useLocaleStore } from "@/store/useLocaleStore";

describe("InventoryPagination", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
  });

  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <InventoryPagination
        page={1}
        totalPages={1}
        hasPreviousPage={false}
        hasNextPage={false}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows page status and invokes previous/next handlers", async () => {
    const user = userEvent.setup();
    const onPrevious = jest.fn();
    const onNext = jest.fn();

    render(
      <InventoryPagination
        page={2}
        totalPages={4}
        hasPreviousPage
        hasNextPage
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    );

    expect(screen.getByText("Page 2 of 4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("disables previous on the first page and next on the last", () => {
    const { rerender } = render(
      <InventoryPagination
        page={1}
        totalPages={3}
        hasPreviousPage={false}
        hasNextPage
        onPrevious={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    rerender(
      <InventoryPagination
        page={3}
        totalPages={3}
        hasPreviousPage
        hasNextPage={false}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
