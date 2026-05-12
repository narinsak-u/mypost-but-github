# Task 8: Write E2E Tests for Profile

## Goal Reference

- `e2e-test-coverage.md` - Profile tested

## Contract Reference

- `e2e-test-spec.md` - Profile test scenarios

## Work Description

### Create Test Directory Structure

```
e2e/
├── profile/
│   ├── view-profile.spec.ts
│   └── edit-profile.spec.ts
```

### Test File: `e2e/profile/view-profile.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("View Profile", () => {
  test("displays own profile with posts", async ({ page }) => {
    await page.goto("/profile/me");

    // Should show user info
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-bio"]')).toBeVisible();

    // Should show user's posts
    await expect(
      page.locator('[data-testid="post-item"]').first(),
    ).toBeVisible();
  });

  test("displays other user profile", async ({ page }) => {
    await page.goto("/profile/user-123");

    // Should show user info (without edit button)
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('button:has-text("Edit Profile")')).toHaveCount(
      0,
    );
  });

  test("shows post count", async ({ page }) => {
    await page.goto("/profile/me");

    await expect(page.locator("text=Posts")).toBeVisible();
    await expect(page.locator('[data-testid="post-count"]')).toBeVisible();
  });

  test("shows follower/following counts", async ({ page }) => {
    await page.goto("/profile/me");

    await expect(page.locator("text=Followers")).toBeVisible();
    await expect(page.locator("text=Following")).toBeVisible();
  });
});
```

### Test File: `e2e/profile/edit-profile.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Edit Profile", () => {
  test("updates name successfully", async ({ page }) => {
    await page.goto("/profile/me");

    // Click edit button
    await page.click('button:has-text("Edit Profile")');

    // Update name
    await page.fill('input[name="name"]', "New Name");
    await page.click('button:has-text("Save")');

    // Name should be updated
    await expect(page.locator('[data-testid="user-name"]')).toHaveText(
      "New Name",
    );
  });

  test("updates bio successfully", async ({ page }) => {
    await page.goto("/profile/me");

    await page.click('button:has-text("Edit Profile")');
    await page.fill('textarea[name="bio"]', "New bio description");
    await page.click('button:has-text("Save")');

    await expect(page.locator('[data-testid="user-bio"]')).toHaveText(
      "New bio description",
    );
  });

  test("updates avatar", async ({ page }) => {
    await page.goto("/profile/me");

    await page.click('button:has-text("Edit Profile")');

    // Upload new avatar
    const avatarInput = page.locator('input[type="file"]');
    await avatarInput.setInputFiles("new-avatar.jpg");

    await page.click('button:has-text("Save")');

    // New avatar should be visible
    await expect(page.locator('img[alt="Avatar"]')).toBeVisible();
  });

  test("cancels edit without saving", async ({ page }) => {
    await page.goto("/profile/me");

    const originalName = await page
      .locator('[data-testid="user-name"]')
      .textContent();

    await page.click('button:has-text("Edit Profile")');
    await page.fill('input[name="name"]', "Changed Name");
    await page.click('button:has-text("Cancel")');

    // Name should be unchanged
    await expect(page.locator('[data-testid="user-name"]')).toHaveText(
      originalName || "",
    );
  });

  test("shows validation errors for invalid name", async ({ page }) => {
    await page.goto("/profile/me");

    await page.click('button:has-text("Edit Profile")');
    await page.fill('input[name="name"]', "");
    await page.click('button:has-text("Save")');

    await expect(page.locator("text=Name is required")).toBeVisible();
  });
});
```

## Acceptance Criteria

- [ ] `e2e/profile/view-profile.spec.ts` has 4 test cases
- [ ] `e2e/profile/edit-profile.spec.ts` has 5 test cases
- [ ] All profile tests pass locally
