import { test, expect } from "@playwright/test";

test.describe("View Profile", () => {
  test("displays user name and bio", async ({ page }) => {
    await page.goto("/profile/me");

    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-bio"]')).toBeVisible();
  });

  test("shows user's posts", async ({ page }) => {
    await page.goto("/profile/me");

    await expect(
      page.locator('[data-testid="post-item"]').first(),
    ).toBeVisible();
  });

  test("shows post count", async ({ page }) => {
    await page.goto("/profile/me");

    await expect(page.locator("text=Posts")).toBeVisible();
    await expect(page.locator('[data-testid="post-count"]')).toBeVisible();
  });
});
