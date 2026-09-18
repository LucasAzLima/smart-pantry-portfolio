/**
 * Shared Supabase public env resolution for browser and server clients.
 *
 * `NEXT_PUBLIC_SUPABASE_URL` must be the project origin only, e.g.
 * `https://xxxx.supabase.co` — not `/rest/v1` or other API paths.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy packages/web/.env.local.example to .env.local.",
    );
  }

  let url: string;
  try {
    const parsed = new URL(rawUrl);
    url = parsed.origin;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid URL like https://xxxx.supabase.co",
    );
  }

  return { url, anonKey };
}

/**
 * Service-role key for privileged server-only operations (e.g. account deletion).
 * Never expose this value to the browser.
 */
export function getSupabaseServiceRoleKey(): string {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Copy packages/web/.env.local.example to .env.local and set the service role key from Supabase → Project Settings → API.",
    );
  }

  return serviceRoleKey;
}
