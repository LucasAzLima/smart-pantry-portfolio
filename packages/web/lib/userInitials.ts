/**
 * Builds avatar initials from a display name or email local-part.
 * Examples: "Lucas Lima" → "LL", "Ada" → "AD", "user@example.com" → "US".
 */
export function getUserInitials(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const trimmedName = typeof name === "string" ? name.trim() : "";

  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      const first = parts[0]?.[0] ?? "";
      const last = parts[parts.length - 1]?.[0] ?? "";
      return `${first}${last}`.toUpperCase();
    }

    return parts[0].slice(0, 2).toUpperCase();
  }

  const localPart =
    typeof email === "string" ? (email.split("@")[0]?.trim() ?? "") : "";

  if (localPart.length >= 2) {
    return localPart.slice(0, 2).toUpperCase();
  }

  if (localPart.length === 1) {
    return localPart.toUpperCase();
  }

  return "?";
}
