import {
  validateAuthCredentials,
} from "./credentials";

describe("validateAuthCredentials", () => {
  it("accepts a valid email and password", () => {
    expect(validateAuthCredentials("User@Example.com", "secret1")).toEqual({
      ok: true,
      credentials: {
        email: "user@example.com",
        password: "secret1",
      },
    });
  });

  it("rejects an invalid email", () => {
    expect(validateAuthCredentials("not-an-email", "secret1")).toEqual({
      ok: false,
      errorKey: "auth.error.invalidEmail",
    });
  });

  it("rejects a short password", () => {
    expect(validateAuthCredentials("user@example.com", "123")).toEqual({
      ok: false,
      errorKey: "auth.error.passwordTooShort",
    });
  });
});
