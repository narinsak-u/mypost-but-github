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

    await expect(page).toHaveURL("/");
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
