import type { MessageKey } from "@/i18n/messages";

export const AUTH_ERROR_KEYS = new Set<MessageKey>([
  "auth.error.invalidEmail",
  "auth.error.passwordTooShort",
  "auth.error.nameRequired",
  "auth.error.nameTooShort",
]);
