import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";
import { useLocaleStore } from "@/store/useLocaleStore";

jest.mock("@/app/actions/auth", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en-US" });
  });

  it("hides the name field on the sign-in tab", () => {
    render(<LoginForm />);

    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
  });

  it("shows the required name field on the sign-up tab", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Sign up" }));

    const nameInput = screen.getByLabelText("Full name");
    expect(nameInput).toBeRequired();
    expect(nameInput).toHaveAttribute("name", "name");
  });

  it("opens on the sign-up tab when initialMode is signUp", () => {
    render(<LoginForm initialMode="signUp" />);

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
