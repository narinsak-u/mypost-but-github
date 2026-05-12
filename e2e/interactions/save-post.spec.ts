import { test, expect } from "@playwright/test";

test.describe("Save Post", () => {
  test("saves a post", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Save"]').first().click();

    await expect(
      page.locator('button[aria-label="Unsave"]').first(),
    ).toBeVisible();
  });

  test("unsaves a saved post", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Save"]').first().click();
    await page.locator('button[aria-label="Unsave"]').first().click();

    await expect(
      page.locator('button[aria-label="Save"]').first(),
    ).toBeVisible();
  });

  test("saved posts appear in saved tab", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Save"]').first().click();
    await page.click('a[href="/saved"]');

    await expect(
      page.locator('[data-testid="post-item"]').first(),
    ).toBeVisible();
  });
});
