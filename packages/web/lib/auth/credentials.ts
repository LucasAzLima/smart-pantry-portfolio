export interface AuthCredentials {
  email: string;
  password: string;
}

export type CredentialsValidationResult =
  | { ok: true; credentials: AuthCredentials }
  | { ok: false; errorKey: "auth.error.invalidEmail" | "auth.error.passwordTooShort" };

export type FullNameValidationResult =
  | { ok: true; fullName: string }
  | { ok: false; errorKey: "auth.error.nameRequired" | "auth.error.nameTooShort" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_FULL_NAME_LENGTH = 2;
const MAX_FULL_NAME_LENGTH = 100;

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

/**
 * Validates the display name collected during sign-up.
 */
export function validateFullName(nameInput: unknown): FullNameValidationResult {
  const fullName = typeof nameInput === "string" ? nameInput.trim() : "";

  if (!fullName) {
    return { ok: false, errorKey: "auth.error.nameRequired" };
  }

  if (fullName.length < MIN_FULL_NAME_LENGTH) {
    return { ok: false, errorKey: "auth.error.nameTooShort" };
  }

  if (fullName.length > MAX_FULL_NAME_LENGTH) {
    return {
      ok: true,
      fullName: fullName.slice(0, MAX_FULL_NAME_LENGTH),
    };
  }

  return { ok: true, fullName };
}
