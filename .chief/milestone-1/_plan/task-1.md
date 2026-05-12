# Task 1: Install and Configure Testing Frameworks

## Goal Reference

- `testing-infrastructure.md` - Set up Vitest + Playwright

## Contract Reference

- `testing-setup.md` - Configuration specifications

## Work Description

### Install Dependencies

Run the following commands to install testing packages:

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom @vitest/ui
npm install -D @playwright/test playwright
npx playwright install chromium
```

### Create Vitest Config

Create `vitest.config.ts` in project root:

```typescript
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
      include: ["hooks/**", "lib/**", "store/**", "actions/**"],
      exclude: ["**/*.d.ts", "**/node_modules/**"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
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
```

### Create Vitest Setup

Create `vitest.setup.ts` in project root:

```typescript
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Create Playwright Config

Create `playwright.config.ts` in project root:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    timeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

## Acceptance Criteria

- [ ] `vitest.config.ts` exists and is valid
- [ ] `vitest.setup.ts` exists and configures jest-dom
- [ ] `playwright.config.ts` exists and is valid
- [ ] `npx vitest --version` returns version
- [ ] `npx playwright --version` returns version
- [ ] Chromium browser installed via Playwright
