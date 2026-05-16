import { test, expect } from "@playwright/test";

test.describe("Posts", () => {
  test("should display the home feed", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  test("should navigate to a post detail page", async ({ page }) => {
    await page.goto("/");
    const firstPost = page.locator("article").first();
    if ((await firstPost.count()) > 0) {
      await firstPost.click();
      await expect(page).toHaveURL(/\/post\//);
    }
  });
});
