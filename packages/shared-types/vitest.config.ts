import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      // El resto del paquete son schemas Zod (sin ramas propias que testear,
      // se validan por construcción/uso en cada app consumidora) y
      // constantes (identity-headers.ts) — solo shipping.ts tiene lógica de
      // negocio real (AGENTS.md §6, "el número no es el objetivo").
      include: ["src/shipping.ts"],
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
