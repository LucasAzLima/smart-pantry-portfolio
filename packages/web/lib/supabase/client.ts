import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy packages/web/.env.local.example to .env.local.",
    );
  }

  return { url, anonKey };
}

/**
 * Browser Supabase client for Client Components.
 * Call inside the browser (or only when env vars are set).
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
