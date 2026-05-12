import { test, expect } from "@playwright/test";

test.describe("Create Post", () => {
  test("creates text post successfully", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Create Post");
    await page.fill('textarea[name="content"]', "Hello World!");
    await page.click('button:has-text("Post")');

    await expect(page.locator("text=Hello World!")).toBeVisible();
  });

  test("shows validation error for empty content", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Create Post");
    await page.click('button:has-text("Post")');

    await expect(page.locator("text=Content is required")).toBeVisible();
  });
});
