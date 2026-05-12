import { test, expect } from "@playwright/test";

test.describe("Delete Post", () => {
  test("deletes own post successfully", async ({ page }) => {
    await page.goto("/");

    await page.click("text=Create Post");
    await page.fill('textarea[name="content"]', "Post to delete");
    await page.click('button:has-text("Post")');

    await page.click('button[aria-label="Delete post"]');
    await page.click('button:has-text("Confirm")');

    await expect(page.locator("text=Post to delete")).toBeHidden();
  });
});
