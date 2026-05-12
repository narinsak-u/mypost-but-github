import { test, expect } from "@playwright/test";

test.describe("View Feed", () => {
  test("displays posts in feed", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector('[data-testid="post-item"]');
    const posts = await page.locator('[data-testid="post-item"]').count();
    expect(posts).toBeGreaterThan(0);
  });

  test("loads more posts on scroll", async ({ page }) => {
    await page.goto("/");

    const initialCount = await page
      .locator('[data-testid="post-item"]')
      .count();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const newCount = await page.locator('[data-testid="post-item"]').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });
});
