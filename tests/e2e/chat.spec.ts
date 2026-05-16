import { test, expect } from "@playwright/test";

test.describe("Chat", () => {
  test("should display the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });
});
