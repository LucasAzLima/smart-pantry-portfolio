/**
 * Reads the display name stored in Supabase Auth `user_metadata.full_name`.
 */
export function readFullNameFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!metadata) {
    return null;
  }

  const value = metadata.full_name;
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
