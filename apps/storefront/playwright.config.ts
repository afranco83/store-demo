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
      // ...process.env: la doc de Playwright dice literalmente "process.env
      // by default" — pasar `env` sin el spread REEMPLAZA todo el entorno
      // heredado en vez de añadirse a él, dejando este proceso sin
      // AUTH_SECRET/DATABASE_URL/etc. En local nunca se notó porque Next.js
      // carga su propio .env igualmente; en CI no hay .env y el login real
      // fallaba con "MissingSecret" (Fase 8, primer run de test:e2e en CI).
      // 127.0.0.1 explícito, no "localhost": Node/undici puede intentar
      // IPv6 (::1) primero al resolver "localhost" en runners Linux, y si
      // next dev no acepta esa ruta el fetch servidor-a-servidor se queda
      // colgado en vez de fallar rápido — visto en CI (login real colgado
      // en /api/auth/callback/credentials, nunca en local).
      env: { ...process.env, API_URL: "http://127.0.0.1:4000" },
      timeout: 60_000,
    },
  ],
});
