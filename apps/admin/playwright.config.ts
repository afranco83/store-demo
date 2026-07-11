import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/admin.json" },
      dependencies: ["setup"],
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
      command: "next start -p 3001",
      url: "http://localhost:3001/login",
      reuseExistingServer: !process.env.CI,
      // ...process.env: la doc de Playwright dice literalmente "process.env
      // by default" — pasar `env` sin el spread REEMPLAZA todo el entorno
      // heredado en vez de añadirse a él, dejando este proceso sin
      // AUTH_SECRET/DATABASE_URL/etc. En local nunca se notó porque Next.js
      // carga su propio .env igualmente; en CI no hay .env y el login real
      // fallaba con "MissingSecret" (Fase 8, primer run de test:e2e en CI).
      env: { ...process.env, API_URL: "http://localhost:4000" },
      timeout: 60_000,
    },
  ],
});
