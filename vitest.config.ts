import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Two projects: the app's components run in a DOM, the repo checks in plain Node (they spawn Git
// and read the file system).
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: "app",
          include: ["src/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "checks",
          include: ["checks/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
