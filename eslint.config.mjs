import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// Type-aware, because the rules that matter most here (floating promises, misused promises) need types.
export default defineConfig(
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      // An async JSX handler is the React idiom and catches its own errors; arguments, returns and
      // variables stay checked.
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  { files: ["**/*.mjs"], ...tseslint.configs.disableTypeChecked },
  globalIgnores([".agents/**", "docs/**", "coverage/**"])
);
