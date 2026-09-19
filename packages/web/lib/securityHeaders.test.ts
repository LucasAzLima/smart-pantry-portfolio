import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from "./securityHeaders";

describe("SECURITY_HEADERS", () => {
  it("includes the baseline browser security headers and CSP", () => {
    const byKey = Object.fromEntries(
      SECURITY_HEADERS.map((header) => [header.key, header.value]),
    );

    expect(byKey["X-Frame-Options"]).toBe("DENY");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Permissions-Policy"]).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
    expect(byKey["Content-Security-Policy"]).toBe(CONTENT_SECURITY_POLICY);
    expect(byKey["Strict-Transport-Security"]).toBeUndefined();
  });

  it("allows Next inline assets and Supabase connections in CSP", () => {
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self' 'unsafe-inline'");
    expect(CONTENT_SECURITY_POLICY).toContain("font-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("https://*.supabase.co");
    expect(CONTENT_SECURITY_POLICY).toContain("wss://*.supabase.co");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
  });
});
