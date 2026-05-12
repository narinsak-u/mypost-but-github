import { test, expect } from "@playwright/test";

test.describe("Edit Post", () => {
  test("edits own post successfully", async ({ page }) => {
    await page.goto("/");

    await page.click('button[aria-label="Edit post"]');
    await page.fill('textarea[name="content"]', "Updated content");
    await page.click('button:has-text("Save")');

    await expect(page.locator("text=Updated content")).toBeVisible();
  });

  test("cancels edit without saving", async ({ page }) => {
    await page.goto("/");

    await page.click('button[aria-label="Edit post"]');
    await page.click('button:has-text("Cancel")');
  });
});
