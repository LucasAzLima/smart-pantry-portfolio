/**
 * Baseline browser security headers for the Next.js app.
 * Kept separate from next.config so they stay unit-testable.
 *
 * CSP allows Next.js inline bootstrap scripts/styles and Supabase Auth/API.
 * HSTS is omitted — Vercel typically sets it at the edge.
 */
export interface SecurityHeader {
  key: string;
  value: string;
}

/**
 * Enforcing CSP compatible with App Router + next/font (self-hosted) + Supabase.
 * Uses 'unsafe-inline' for script/style (Next without per-request nonces).
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
]
  .join("; ")
  .replace(/\s+/g, " ")
  .trim();

export const SECURITY_HEADERS: readonly SecurityHeader[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: CONTENT_SECURITY_POLICY,
  },
] as const;
