import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./lib/securityHeaders";

const nextConfig: NextConfig = {
  transpilePackages: ["@smart-pantry/ui"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS.map(({ key, value }) => ({ key, value })),
      },
    ];
  },
};

export default nextConfig;
