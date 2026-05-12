import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["hooks/**", "lib/*.ts", "store/**"],
      exclude: [
        "**/*.d.ts",
        "**/node_modules/**",
        "hooks/use-format-date.tsx",
        "hooks/keys.ts",
        "hooks/use-get-user.ts",
        "lib/auth-client.ts",
        "lib/auth.ts",
        "lib/prismadb.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 65,
        branches: 50,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
