import vitestPlugin from "@vitest/eslint-plugin";
import testingLibrary from "eslint-plugin-testing-library";

export const testConfig = [
  {
    files: ["**/*.test.{ts,tsx}"],
    plugins: {
      "testing-library": testingLibrary,
      vitest: vitestPlugin,
    },
    rules: {
      ...testingLibrary.configs["flat/react"].rules,
      ...vitestPlugin.configs.recommended.rules,
    },
  },
];
