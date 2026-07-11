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
      // Puerto explícito por robustez (mismo criterio que apps/admin, ver
      // ROADMAP.md Fase 8): "next start" sin -p cae al 3000 por defecto de
      // todos modos, pero depender de eso en vez de fijarlo es la misma
      // fragilidad latente que sí llegó a romper admin.
      command: "next start -p 3000",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      env: { API_URL: "http://localhost:4000" },
      timeout: 60_000,
    },
  ],
});
