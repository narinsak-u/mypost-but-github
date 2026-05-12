import { test, expect } from "@playwright/test";

test.describe("Comment", () => {
  test("adds a comment to a post", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Comment"]').first().click();
    await page.fill('textarea[name="comment"]', "Great post!");
    await page.click('button:has-text("Submit")');

    await expect(page.locator("text=Great post!")).toBeVisible();
  });

  test("shows validation error for empty comment", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Comment"]').first().click();
    await page.click('button:has-text("Submit")');

    await expect(page.locator("text=Comment cannot be empty")).toBeVisible();
  });

  test("deletes own comment", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Comment"]').first().click();
    await page.fill('textarea[name="comment"]', "Test comment");
    await page.click('button:has-text("Submit")');

    await page.locator('button[aria-label="Delete comment"]').click();
    await page.click('button:has-text("Confirm")');

    await expect(page.locator("text=Test comment")).toBeHidden();
  });
});
