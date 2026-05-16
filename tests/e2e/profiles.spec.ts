import { test, expect } from "@playwright/test";

test.describe("Profiles", () => {
  test("should be able to visit the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });
});
