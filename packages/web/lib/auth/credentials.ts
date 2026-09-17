export interface AuthCredentials {
  email: string;
  password: string;
}

export type CredentialsValidationResult =
  | { ok: true; credentials: AuthCredentials }
  | { ok: false; errorKey: "auth.error.invalidEmail" | "auth.error.passwordTooShort" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Validates email/password before calling Supabase Auth.
 */
export function validateAuthCredentials(
  emailInput: unknown,
  passwordInput: unknown,
): CredentialsValidationResult {
  const email =
    typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
  const password = typeof passwordInput === "string" ? passwordInput : "";

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, errorKey: "auth.error.invalidEmail" };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, errorKey: "auth.error.passwordTooShort" };
  }

  return { ok: true, credentials: { email, password } };
}
