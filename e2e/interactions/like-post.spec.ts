import { test, expect } from "@playwright/test";

test.describe("Like Post", () => {
  test("likes a post", async ({ page }) => {
    await page.goto("/");

    const likeButton = page.locator('button[aria-label="Like"]').first();
    await likeButton.click();

    await expect(
      page.locator('button[aria-label="Unlike"]').first(),
    ).toBeVisible();
  });

  test("unlikes a liked post", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Like"]').first().click();
    await page.locator('button[aria-label="Unlike"]').first().click();

    await expect(
      page.locator('button[aria-label="Like"]').first(),
    ).toBeVisible();
  });

  test("toggles like state correctly", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Like"]').first().click();
    await expect(
      page.locator('button[aria-label="Unlike"]').first(),
    ).toBeVisible();

    await page.locator('button[aria-label="Unlike"]').first().click();
    await expect(
      page.locator('button[aria-label="Like"]').first(),
    ).toBeVisible();
  });
});
