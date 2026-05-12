# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interactions\comment.spec.ts >> Comment >> adds a comment to a post
- Location: e2e\interactions\comment.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[aria-label="Comment"]').first()

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
  3  | test.describe("Comment", () => {
  4  |   test("adds a comment to a post", async ({ page }) => {
  5  |     await page.goto("/");
  6  | 
> 7  |     await page.locator('button[aria-label="Comment"]').first().click();
     |                                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |     await page.fill('textarea[name="comment"]', "Great post!");
  9  |     await page.click('button:has-text("Submit")');
  10 | 
  11 |     await expect(page.locator("text=Great post!")).toBeVisible();
  12 |   });
  13 | 
  14 |   test("shows validation error for empty comment", async ({ page }) => {
  15 |     await page.goto("/");
  16 | 
  17 |     await page.locator('button[aria-label="Comment"]').first().click();
  18 |     await page.click('button:has-text("Submit")');
  19 | 
  20 |     await expect(page.locator("text=Comment cannot be empty")).toBeVisible();
  21 |   });
  22 | 
  23 |   test("deletes own comment", async ({ page }) => {
  24 |     await page.goto("/");
  25 | 
  26 |     await page.locator('button[aria-label="Comment"]').first().click();
  27 |     await page.fill('textarea[name="comment"]', "Test comment");
  28 |     await page.click('button:has-text("Submit")');
  29 | 
  30 |     await page.locator('button[aria-label="Delete comment"]').click();
  31 |     await page.click('button:has-text("Confirm")');
  32 | 
  33 |     await expect(page.locator("text=Test comment")).toBeHidden();
  34 |   });
  35 | });
  36 | 
```