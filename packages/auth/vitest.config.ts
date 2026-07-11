import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      // El resto del paquete (config.ts, auth.config.ts, middleware-guard.ts,
      // get-api-token.ts, logout.ts) depende de next-auth/next/headers en
      // tiempo de ejecución real — se cubre por integración/E2E desde
      // apps/storefront y apps/admin (ver ROADMAP.md Fase 5), no por test
      // unitario aislado. cookies.ts es la única función pura del paquete.
      include: ["src/cookies.ts"],
      exclude: ["src/**/*.test.ts"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
