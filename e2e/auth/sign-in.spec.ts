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
