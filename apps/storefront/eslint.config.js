import { nextConfig } from "@store-demo/eslint-config/next.js";
import { testConfig } from "@store-demo/eslint-config/test.js";

export default [
  ...nextConfig,
  ...testConfig,
  {
    // lighthouserc.cjs es el único archivo CommonJS del repo (@lhci/cli
    // carga la config con require() — ver el propio archivo). El resto del
    // monorepo es ESM, así que no hay globals de Node configurados en
    // ningún preset compartido.
    files: ["lighthouserc.cjs"],
    languageOptions: {
      globals: { require: "readonly", module: "writable" },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
