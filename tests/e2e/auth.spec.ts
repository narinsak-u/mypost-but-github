import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/mypost/i);
  });

  test("should show login option for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/");
    const signInButton = page
      .getByRole("button", { name: /sign in|log in|login|join now/i })
      .first();
    await expect(signInButton).toBeVisible();
  });
});
