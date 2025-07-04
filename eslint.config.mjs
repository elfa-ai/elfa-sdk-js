import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Files to lint
  { files: ["**/*.{js,mjs,cjs,ts}"] },

  // Global variables
  { languageOptions: { globals: { ...globals.node, ...globals.jest } } },

  // Base configurations
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // TypeScript-specific configuration
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: ".",
      },
    },
    rules: {
      // Match old .eslintrc.js - very permissive
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
    },
  },

  // Files to ignore
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.js", // Ignore JS files in root (like jest.config.js)
      "*.mjs", // Ignore other mjs files
      "*.d.ts", // Ignore declaration files
    ],
  },
];
