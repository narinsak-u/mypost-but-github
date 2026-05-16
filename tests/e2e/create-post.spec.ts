import { test, expect } from "@playwright/test";

test.describe("Post Creation Flow", () => {
  const testEmail = `test-user-${Date.now()}@example.com`;
  const testPassword = "Password123!";

  test("should allow a user to sign up and create a post", async ({ page }) => {
    // 1. Navigate to home
    await page.goto("/");

    // 2. Click "Create a Post" which should trigger the LoginModal for unauthenticated users
    const createPostBtn = page.getByRole("button", { name: /create a post/i });
    await createPostBtn.click();

    // 3. Switch to Sign Up tab
    await page.getByRole("tab", { name: /sign up/i }).click();

    // 4. Fill in Sign Up form
    await page.locator("#signup-email").fill(testEmail);
    await page.locator("#signup-password").fill(testPassword);
    await page.locator("#signup-confirm").fill(testPassword);
    await page.getByRole("button", { name: /sign up/i }).click();

    // 5. Verify success toast and modal closure
    await expect(page.getByText(/account created successfully/i)).toBeVisible();
    await expect(page.locator("#signup-email")).not.toBeVisible();
    
    // Reload page to ensure session is fully synced for server actions
    await page.reload();
    
    // Wait for session to be reflected in Nav (User Avatar or Join Now disappearance)
    await expect(page.getByRole("button", { name: /join now/i })).not.toBeVisible();

    // 6. Now click "Create a Post" again as an authenticated user
    await createPostBtn.click();

    // 7. Fill in the Post Drawer
    const title = `My E2E Post - ${Date.now()}`;
    
    // The title starts as "Untitled" and is a button that switches to a textarea
    const titleTrigger = page.getByRole("button", { name: "Untitled" });
    await titleTrigger.click();
    await page.locator("textarea[placeholder='Enter your title...']").fill(title);
    await page.keyboard.press("Enter");

    // Add a tag
    await page.getByRole("button", { name: "+ Tag" }).click();
    await page.getByText("Programming", { exact: true }).click();

    // Fill the editor (BlockNote)
    // BlockNote uses a contenteditable div with class 'bn-editor'
    const editor = page.locator(".bn-editor");
    await editor.click();
    await page.keyboard.type("This is a post created by Playwright E2E test.");

    // Submit the post
    await page.getByRole("button", { name: "Create post", exact: true }).click();

    // 8. Verify success and post visibility
    await expect(page.getByText(/post has been created/i)).toBeVisible();
    
    // Check if the post appears in the feed
    await expect(page.getByText(title)).toBeVisible();
  });
});
