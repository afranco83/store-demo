import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @store-demo/api dev",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: !process.env.CI,
      cwd: "../..",
      timeout: 60_000,
    },
    {
      command: "next start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      env: { API_URL: "http://localhost:4000" },
      timeout: 60_000,
    },
  ],
});
