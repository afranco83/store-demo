import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export const base = tseslint.config(
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/storybook-static/**",
      "**/playwright-report/**",
      "**/.turbo/**",
      "**/node_modules/**",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
);
