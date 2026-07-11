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
    // válido.
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
      // A diferencia de apps/storefront, apps/admin no tiene carpetas
      // hooks/services/store/lib/schemas (sin TanStack Query ni Zustand,
      // ver docs/adr/0005-admin-without-query-zustand.md) — su lógica
      // testeable en aislado vive en los Client Components de
      // features/**/components (formularios RHF+Zod, tablas con acciones),
      // ya cubiertos por test de integración real (renderWithProviders +
      // userEvent). Antes de Fase 8 este include apuntaba a las carpetas de
      // apps/storefront por error de copia — el umbral llevaba pasando en
      // vacío (0/0 archivos) desde la Fase 7 sin comprobar nada de verdad.
      // Las Server Actions de `features/**/api` siguen fuera del umbral:
      // envuelven signIn()/redirect()/cookies(), se validan mockeadas desde
      // el componente (ver LoginForm.test.tsx) y de extremo a extremo en los
      // specs E2E, no por cobertura unitaria.
      include: ["src/features/**/components/**/*.tsx"],
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
