# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth\sign-out.spec.ts >> Sign Out >> clears session and redirects to sign-in
- Location: e2e\auth\sign-out.spec.ts:4:7

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
  3  | test.describe("Sign Out", () => {
  4  |   test("clears session and redirects to sign-in", async ({ page }) => {
  5  |     await page.goto("/sign-in");
> 6  |     await page.fill('input[name="email"]', "test@example.com");
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  7  |     await page.fill('input[name="password"]', "TestPass123!");
  8  |     await page.click('button[type="submit"]');
  9  |     await expect(page).toHaveURL("/");
  10 | 
  11 |     await page.click("text=Sign Out");
  12 |     await expect(page).toHaveURL("/sign-in");
  13 |   });
  14 | });
  15 | 
```