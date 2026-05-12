import { test, expect } from "@playwright/test";

test.describe("Edit Profile", () => {
  test("updates name successfully", async ({ page }) => {
    await page.goto("/profile/me");

    await page.click("text=Edit Profile");
    await page.fill('input[name="name"]', "New Name");
    await page.click('button:has-text("Save")');

    await expect(page.locator('[data-testid="user-name"]')).toHaveText(
      "New Name",
    );
  });

  test("updates bio successfully", async ({ page }) => {
    await page.goto("/profile/me");

    await page.click("text=Edit Profile");
    await page.fill('textarea[name="bio"]', "New bio");
    await page.click('button:has-text("Save")');

    await expect(page.locator('[data-testid="user-bio"]')).toHaveText(
      "New bio",
    );
  });

  test("cancels edit without saving", async ({ page }) => {
    await page.goto("/profile/me");

    const originalName = await page
      .locator('[data-testid="user-name"]')
      .textContent();

    await page.click("text=Edit Profile");
    await page.fill('input[name="name"]', "Changed Name");
    await page.click('button:has-text("Cancel")');

    await expect(page.locator('[data-testid="user-name"]')).toHaveText(
      originalName || "",
    );
  });
});
