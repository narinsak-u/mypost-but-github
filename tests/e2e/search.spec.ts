import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("should display the home page with search", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });
});
