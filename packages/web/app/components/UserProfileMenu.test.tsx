import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProfileMenu } from "./UserProfileMenu";
import { deleteAccount, signOut } from "@/app/actions/auth";
import { useLocaleStore } from "@/store/useLocaleStore";
import { usePantryStore } from "@/store/usePantryStore";

jest.mock("@/app/actions/auth", () => ({
  signOut: jest.fn(),
  deleteAccount: jest.fn(),
}));

const mockedSignOut = jest.mocked(signOut);
const mockedDeleteAccount = jest.mocked(deleteAccount);

describe("UserProfileMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSignOut.mockResolvedValue(undefined);
    mockedDeleteAccount.mockResolvedValue({ ok: true });

    act(() => {
      useLocaleStore.setState({ locale: "en-US" });
      useLocaleStore.persist.clearStorage();
      usePantryStore.setState({
        userId: "user-1",
        isGuest: false,
      });
    });
  });

  it("opens a menu with profile details and initials", async () => {
    const user = userEvent.setup();

    render(
      <UserProfileMenu userName="Lucas Lima" userEmail="lucas@example.com" />,
    );

    const trigger = screen.getByRole("button", { name: "Account menu" });
    expect(trigger).toHaveTextContent("LL");

    await user.click(trigger);

    const menu = screen.getByRole("menu", { name: "Account menu" });
    expect(within(menu).getByText("Lucas Lima")).toBeInTheDocument();
    expect(within(menu).getByText("lucas@example.com")).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: "Sign out" }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: "Delete account" }),
    ).toBeInTheDocument();
  });

  it("asks for confirmation before signing out", async () => {
    const user = userEvent.setup();

    render(
      <UserProfileMenu userName="Lucas Lima" userEmail="lucas@example.com" />,
    );

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));

    const dialog = screen.getByRole("dialog", { name: "Sign out?" });
    expect(mockedSignOut).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalledTimes(1);
    });
    expect(usePantryStore.getState().userId).toBeNull();
    expect(usePantryStore.getState().isGuest).toBe(true);
  });

  it("asks for confirmation before deleting the account", async () => {
    const user = userEvent.setup();

    render(
      <UserProfileMenu userName="Lucas Lima" userEmail="lucas@example.com" />,
    );

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete account" }));

    const dialog = screen.getByRole("dialog", { name: "Delete account?" });
    expect(mockedDeleteAccount).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("button", { name: "Delete account" }),
    );

    await waitFor(() => {
      expect(mockedDeleteAccount).toHaveBeenCalledTimes(1);
    });
    expect(usePantryStore.getState().userId).toBeNull();
    expect(usePantryStore.getState().isGuest).toBe(true);
  });

  it("keeps the session when account deletion fails", async () => {
    const user = userEvent.setup();
    mockedDeleteAccount.mockResolvedValue({
      ok: false,
      error: "auth.error.deleteUnavailable",
    });

    render(
      <UserProfileMenu userName="Lucas Lima" userEmail="lucas@example.com" />,
    );

    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete account" }));
    await user.click(
      screen.getByRole("button", { name: "Delete account" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Account deletion is not configured/i),
      ).toBeInTheDocument();
    });
    expect(usePantryStore.getState().userId).toBe("user-1");
    expect(usePantryStore.getState().isGuest).toBe(false);
  });
});
