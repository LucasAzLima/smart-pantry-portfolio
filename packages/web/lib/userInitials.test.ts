import { getUserInitials } from "./userInitials";

describe("getUserInitials", () => {
  it("uses first and last name initials", () => {
    expect(getUserInitials("Lucas Lima", "lucas@example.com")).toBe("LL");
  });

  it("uses the first two characters of a single name", () => {
    expect(getUserInitials("Ada", null)).toBe("AD");
  });

  it("falls back to the email local-part", () => {
    expect(getUserInitials(null, "user@example.com")).toBe("US");
  });

  it("returns a placeholder when nothing usable is available", () => {
    expect(getUserInitials(null, null)).toBe("?");
  });
});
