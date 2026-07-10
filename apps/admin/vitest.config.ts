import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // El tsconfig de la app usa jsx: "preserve" (lo exige Next.js, que aplica su
  // propia transformación); fuera del pipeline de Next, Vitest necesita su
  // propio plugin de React para transformar el JSX.
  plugins: [react()],
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
      // Igual que en apps/storefront, las Server Actions de `features/**/api`
      // quedan fuera de este umbral: envuelven signIn()/redirect()/cookies(),
      // se validan mockeadas desde el componente (ver LoginForm.test.tsx) y
      // de extremo a extremo en los specs E2E, no por cobertura unitaria.
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
