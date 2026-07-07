import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import { base } from "./base.js";

export const reactConfig = [
  ...base,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs["recommended-latest"].rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
