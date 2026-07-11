import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // El tsconfig de la app usa jsx: "preserve" (lo exige Next.js, que aplica su
  // propia transformación); fuera del pipeline de Next, Vitest necesita su
  // propio plugin de React para transformar el JSX.
  plugins: [react()],
  resolve: {
    // tsconfig.json resuelve "@/*" para tsc/Next.js, pero Vite (el bundler
    // real de Vitest) no lee automáticamente los `paths` de tsconfig — sin
    // este alias, cualquier import "@/..." en un componente con test
    // unitario falla en Vitest aunque tsc/el build de Next.js lo den por
    // válido. Gap latente nunca ejercitado hasta ahora porque ningún
    // componente testeado de esta app importaba vía "@/..." (solo lo hacían
    // páginas Server Component, que no se testean unitariamente).
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    // Los specs de Playwright (e2e/**) usan su propio test runner, no Vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
    setupFiles: [
      "@store-demo/testing/vitest-setup",
      "./src/test/msw-setup.ts",
      "./src/test/next-headers-mock.ts",
    ],
    coverage: {
      provider: "v8",
      // AGENTS.md §6: el umbral de cobertura aplica a hooks/servicios de
      // dominio, no a componentes de composición Server/Client (esos se
      // validan por integración/E2E, no por cobertura unitaria exhaustiva).
      include: [
        "src/features/**/hooks/**/*.ts",
        "src/features/**/services/**/*.ts",
        "src/features/**/store/**/*.ts",
        "src/features/**/lib/**/*.ts",
        "src/features/**/schemas/**/*.ts",
      ],
      exclude: ["src/**/*.stories.tsx", "src/**/*.test.{ts,tsx}"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
