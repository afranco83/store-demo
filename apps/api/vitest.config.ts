import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mismo gap que apps/storefront y apps/admin (Fase 7, ROADMAP.md): Vite
    // no lee "paths" de tsconfig.json automáticamente.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      // El resto de apps/api son Route Handlers (Next.js) y el script de
      // seed — cubiertos por los specs E2E de storefront/admin contra la API
      // real, no por test unitario aislado (mismo criterio que
      // apps/storefront/apps/admin: el umbral acota a lógica de dominio
      // pura, no a la composición de infraestructura de Next.js).
      include: ["src/lib/guard.ts"],
      exclude: ["src/**/*.test.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
