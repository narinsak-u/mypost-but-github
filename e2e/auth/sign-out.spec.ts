import { test, expect } from "@playwright/test";

test.describe("Sign Out", () => {
  test("clears session and redirects to sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    await page.click("text=Sign Out");
    await expect(page).toHaveURL("/sign-in");
  });
});
