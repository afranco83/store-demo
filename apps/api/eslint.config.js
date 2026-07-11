import { nextConfig } from "@store-demo/eslint-config/next.js";
import { testConfig } from "@store-demo/eslint-config/test.js";

export default [{ ignores: ["src/generated/**"] }, ...nextConfig, ...testConfig];
