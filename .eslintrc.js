// Legacy ESLint config - replaced by eslint.config.mjs
// This file is kept for compatibility but eslint.config.mjs is used
module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended"],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-unused-vars": "off",
  },
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ["dist/", "node_modules/"],
};
