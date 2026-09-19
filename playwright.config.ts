import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

const isCI = Boolean(process.env.CI);

/**
 * Dummy Supabase env so the Next server can construct clients on `/`
 * without real credentials (guest demo only).
 */
const webServerEnv: NodeJS.ProcessEnv = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "ci-dummy-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "ci-dummy-service-role",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -w web",
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: webServerEnv,
  },
});
