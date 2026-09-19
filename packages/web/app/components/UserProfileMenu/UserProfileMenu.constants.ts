import type { MessageKey } from "@/i18n/messages";

export const DELETE_ERROR_KEYS = new Set<MessageKey>([
  "auth.error.notAuthenticated",
  "auth.error.deleteUnavailable",
  "auth.error.unexpected",
]);
