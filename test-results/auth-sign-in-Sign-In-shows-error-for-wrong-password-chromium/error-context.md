# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\sign-in.spec.ts >> Sign In >> shows error for wrong password
- Location: e2e\auth\sign-in.spec.ts:16:7

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
  3  | test.describe("Sign In", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/sign-in");
  6  |   });
  7  | 
  8  |   test("logs in successfully with valid credentials", async ({ page }) => {
  9  |     await page.fill('input[name="email"]', "test@example.com");
  10 |     await page.fill('input[name="password"]', "TestPass123!");
  11 |     await page.click('button[type="submit"]');
  12 | 
  13 |     await expect(page).toHaveURL("/");
  14 |   });
  15 | 
  16 |   test("shows error for wrong password", async ({ page }) => {
> 17 |     await page.fill('input[name="email"]', "test@example.com");
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  18 |     await page.fill('input[name="password"]', "WrongPass123!");
  19 |     await page.click('button[type="submit"]');
  20 | 
  21 |     await expect(page.locator("text=Invalid credentials")).toBeVisible();
  22 |   });
  23 | 
  24 |   test("persists session after page reload", async ({ page }) => {
  25 |     await page.fill('input[name="email"]', "test@example.com");
  26 |     await page.fill('input[name="password"]', "TestPass123!");
  27 |     await page.click('button[type="submit"]');
  28 | 
  29 |     await page.reload();
  30 |     await expect(page).toHaveURL("/");
  31 |   });
  32 | });
  33 | 
```