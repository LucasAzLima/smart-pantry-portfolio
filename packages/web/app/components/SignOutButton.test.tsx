import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignOutButton } from "./SignOutButton";
import { signOut } from "@/app/actions/auth";
import { useLocaleStore } from "@/store/useLocaleStore";
import { usePantryStore } from "@/store/usePantryStore";

jest.mock("@/app/actions/auth", () => ({
  signOut: jest.fn(),
}));

const mockedSignOut = jest.mocked(signOut);

describe("SignOutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSignOut.mockResolvedValue(undefined);

    act(() => {
      useLocaleStore.setState({ locale: "en-US" });
      useLocaleStore.persist.clearStorage();
      usePantryStore.setState({
        userId: "user-1",
        isGuest: false,
      });
    });
  });

  it("asks for confirmation before signing out", async () => {
    const user = userEvent.setup();

    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    const dialog = screen.getByRole("dialog", { name: "Sign out?" });
    expect(
      within(dialog).getByText("Are you sure you want to sign out?"),
    ).toBeInTheDocument();
    expect(mockedSignOut).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalledTimes(1);
    });
    expect(usePantryStore.getState().userId).toBeNull();
    expect(usePantryStore.getState().isGuest).toBe(true);
  });

  it("does not sign out when confirmation is cancelled", async () => {
    const user = userEvent.setup();

    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockedSignOut).not.toHaveBeenCalled();
  });
});
