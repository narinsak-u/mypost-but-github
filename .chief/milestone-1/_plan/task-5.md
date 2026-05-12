# Task 5: Write E2E Tests for Auth Flow

## Goal Reference

- `e2e-test-coverage.md` - Auth flow tested

## Contract Reference

- `e2e-test-spec.md` - Auth test scenarios

## Work Description

### Create Test Directory Structure

```
e2e/
├── auth/
│   ├── sign-up.spec.ts
│   ├── sign-in.spec.ts
│   └── sign-out.spec.ts
```

### Test File: `e2e/auth/sign-up.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Sign Up", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-up");
  });

  test("creates new account successfully", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.fill('input[name="name"]', "Test User");
    await page.click('button[type="submit"]');

    // Should redirect to home after signup
    await expect(page).toHaveURL("/");
    await expect(page.locator("text=Test User")).toBeVisible();
  });

  test("shows validation errors for invalid email", async ({ page }) => {
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.fill('input[name="name"]', "Test");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("shows error for weak password", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "weak");
    await page.fill('input[name="name"]', "Test");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Password too weak")).toBeVisible();
  });
});
```

### Test File: `e2e/auth/sign-in.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Sign In", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
  });

  test("logs in successfully with valid credentials", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/");
  });

  test("shows error for wrong password", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "WrongPass123!");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });

  test("persists session after page reload", async ({ page }) => {
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');

    await page.reload();
    await expect(page).toHaveURL("/");
  });
});
```

### Test File: `e2e/auth/sign-out.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Sign Out", () => {
  test("clears session and redirects to sign-in", async ({ page }) => {
    // First sign in
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // Sign out
    await page.click('button:has-text("Sign Out")');
    await expect(page).toHaveURL("/sign-in");
  });
});
```

### Fixtures (Optional)

Create `e2e/fixtures.ts` for shared test user:

```typescript
import { test as base } from "@playwright/test";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Sign in before each test that uses this fixture
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");
    await use(page);
  },
});
```

## Acceptance Criteria

- [ ] `e2e/auth/sign-up.spec.ts` has 3 test cases
- [ ] `e2e/auth/sign-in.spec.ts` has 3 test cases
- [ ] `e2e/auth/sign-out.spec.ts` has 1 test case
- [ ] All auth tests pass locally (`npm run test:e2e`)
