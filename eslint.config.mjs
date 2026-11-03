import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// Next's own config is not type-aware, so a dropped promise would pass lint. The type-checked
// recommended set adds that, through the TypeScript project service.
export default defineConfig(
  ...nextVitals,
  ...nextTs,
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
  { files: ["**/*.{js,cjs,mjs}"], ...tseslint.configs.disableTypeChecked },
  // ESLint does not read .gitignore: build output, agent worktrees and scratch are listed here.
  globalIgnores([
    "**/.next/**",
    ".claude/worktrees/**",
    ".superpowers/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    "docs/**",
    "coverage/**",
  ])
);
