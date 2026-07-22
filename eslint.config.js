import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions },
    },
  },
  {
    files: ["scripts/**/*.mjs", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
);
