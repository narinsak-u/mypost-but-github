# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\sign-up.spec.ts >> Sign Up >> shows validation errors for invalid email
- Location: e2e\auth\sign-up.spec.ts:17:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Sign in" [level=1] [ref=e5]
      - paragraph [ref=e6]: Enter your email below to sign in to your account
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Email
        - textbox "Email" [ref=e10]:
          - /placeholder: name@example.com
      - generic [ref=e11]:
        - generic [ref=e12]: Password
        - textbox "Password" [ref=e13]
      - button "Sign in" [ref=e14]
    - generic [ref=e19]: Or continue with
    - generic [ref=e20]:
      - button "GitHub" [ref=e21]:
        - img [ref=e22]
        - text: GitHub
      - button "Google" [ref=e24]:
        - img [ref=e25]
        - text: Google
    - paragraph [ref=e30]:
      - text: Don't have an account?
      - button "Sign up" [ref=e31]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e37] [cursor=pointer]:
    - img [ref=e38]
  - alert [ref=e41]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Sign Up", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/sign-up");
  6  |   });
  7  | 
  8  |   test("creates new account successfully", async ({ page }) => {
  9  |     await page.fill('input[name="email"]', "test@example.com");
  10 |     await page.fill('input[name="password"]', "TestPass123!");
  11 |     await page.fill('input[name="name"]', "Test User");
  12 |     await page.click('button[type="submit"]');
  13 | 
  14 |     await expect(page).toHaveURL("/");
  15 |   });
  16 | 
  17 |   test("shows validation errors for invalid email", async ({ page }) => {
> 18 |     await page.fill('input[name="email"]', "invalid-email");
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  19 |     await page.fill('input[name="password"]', "TestPass123!");
  20 |     await page.fill('input[name="name"]', "Test");
  21 |     await page.click('button[type="submit"]');
  22 | 
  23 |     await expect(page.locator("text=Invalid email")).toBeVisible();
  24 |   });
  25 | 
  26 |   test("shows error for weak password", async ({ page }) => {
  27 |     await page.fill('input[name="email"]', "test@example.com");
  28 |     await page.fill('input[name="password"]', "weak");
  29 |     await page.fill('input[name="name"]', "Test");
  30 |     await page.click('button[type="submit"]');
  31 | 
  32 |     await expect(page.locator("text=Password too weak")).toBeVisible();
  33 |   });
  34 | });
  35 | 
```