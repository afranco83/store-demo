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
      // carga su propio .env igualmente; en CI no hay .env, así que esto
      // era una capa real del problema — aunque no la única (ver
      // --env-mode=loose en ci.yml para la causa raíz completa: Turborepo
      // descartaba estas variables antes de que llegaran siquiera aquí).
      // 127.0.0.1 explícito por si acaso, no "localhost" — no confirmado
      // como necesario una vez arreglada la causa raíz, pero inofensivo.
      env: { ...process.env, API_URL: "http://127.0.0.1:4000" },
      timeout: 60_000,
    },
  ],
});
