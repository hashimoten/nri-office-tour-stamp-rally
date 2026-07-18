import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/**", "dev-dist/**", "node_modules/**", "public/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node, ...globals.nodeBuiltin },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["service-worker.js"],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.nodeBuiltin } },
  },
];
