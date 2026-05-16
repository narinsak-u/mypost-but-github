import { test, expect } from "@playwright/test";

test.describe("Comments", () => {
  test("should be able to view a post page", async ({ page }) => {
    await page.goto("/");
    const firstPost = page.locator("article").first();
    if ((await firstPost.count()) > 0) {
      await firstPost.click();
      await expect(page).toHaveURL(/\/post\//);
    }
  });
});
