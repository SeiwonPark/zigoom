module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "prettier"],
  ignorePatterns: ["/dist/**/*"],
  rules: {
    "prettier/prettier": "warn",
    quotes: ["error", "double"],
    "import/no-unresolved": 0,
    "quote-props": 0,
    "@typescript-eslint/no-explicit-any": 0,
  },
};
