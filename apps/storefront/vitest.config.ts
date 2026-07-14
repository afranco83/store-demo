import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

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
      // Fase de i18n: next-intl importa "next/navigation" desde su propia
      // copia anidada de `next` dentro de .pnpm (una permutación de peer
      // deps distinta a la que usa esta app directamente, resultado normal
      // de cómo pnpm resuelve peers duplicados) — Vite/vite-node no le
      // aplica la resolución de extensión por defecto de Node ahí y falla
      // con "Cannot find module .../next/navigation". Alias explícito al
      // fichero real ya resuelto por esta app, para que cualquier import de
      // "next/navigation" (sea de quien sea) apunte a la misma instancia.
      "next/navigation": require.resolve("next/navigation"),
    },
    dedupe: ["next"],
  },
  test: {
    environment: "jsdom",
    // Los specs de Playwright (e2e/**) usan su propio test runner, no Vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
    server: {
      deps: {
        // Por defecto Vitest externaliza los paquetes de node_modules (los
        // carga con el resolver nativo de Node, sin pasar por Vite) — eso
        // hace que el alias de "next/navigation" de arriba no se aplique
        // nunca para next-intl, y su copia anidada de `next` dentro de
        // .pnpm (otra permutación de peer deps) falla al resolver
        // "next/navigation" sin extensión. "Inline" fuerza a que next-intl
        // pase por el pipeline de Vite, donde el alias sí aplica.
        inline: ["next-intl"],
      },
    },
    setupFiles: [
      "@store-demo/testing/vitest-setup",
      "./src/test/msw-setup.ts",
      "./src/test/next-headers-mock.ts",
      "./src/test/next-intl-server-mock.ts",
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
