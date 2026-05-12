# Task 7: Write E2E Tests for Interactions

## Goal Reference

- `e2e-test-coverage.md` - Interactions tested

## Contract Reference

- `e2e-test-spec.md` - Interactions test scenarios

## Work Description

### Create Test Directory Structure

```
e2e/
├── interactions/
│   ├── like-post.spec.ts
│   ├── comment.spec.ts
│   └── save-post.spec.ts
```

### Test File: `e2e/interactions/like-post.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Like Post", () => {
  test("likes a post", async ({ page }) => {
    await page.goto("/");

    const likeButton = page.locator('button[aria-label="Like"]').first();
    const likeCountBefore = await likeButton.locator("span").textContent();

    await likeButton.click();

    // Should now show unlike button
    await expect(
      page.locator('button[aria-label="Unlike"]').first(),
    ).toBeVisible();

    // Count should increase by 1
    const likeCountAfter = await likeButton.locator("span").textContent();
    expect(parseInt(likeCountAfter || "0")).toBe(
      parseInt(likeCountBefore || "0") + 1,
    );
  });

  test("unlikes a liked post", async ({ page }) => {
    await page.goto("/");

    // Like the post first
    await page.locator('button[aria-label="Like"]').first().click();

    // Unlike it
    await page.locator('button[aria-label="Unlike"]').first().click();

    // Should show like button again
    await expect(
      page.locator('button[aria-label="Like"]').first(),
    ).toBeVisible();
  });

  test("toggles like state correctly", async ({ page }) => {
    await page.goto("/");

    const likeButton = page.locator('button[aria-label="Like"]').first();

    // Like
    await likeButton.click();
    await expect(
      page.locator('button[aria-label="Unlike"]').first(),
    ).toBeVisible();

    // Unlike
    await page.locator('button[aria-label="Unlike"]').first().click();
    await expect(
      page.locator('button[aria-label="Like"]').first(),
    ).toBeVisible();
  });
});
```

### Test File: `e2e/interactions/comment.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Comment", () => {
  test("adds a comment to a post", async ({ page }) => {
    await page.goto("/");

    // Open comment section
    await page.locator('button[aria-label="Comment"]').first().click();

    // Add comment
    await page.fill('textarea[name="comment"]', "Great post!");
    await page.click('button:has-text("Submit")');

    // Comment should appear
    await expect(page.locator("text=Great post!")).toBeVisible();
  });

  test("shows validation error for empty comment", async ({ page }) => {
    await page.goto("/");

    await page.locator('button[aria-label="Comment"]').first().click();
    await page.click('button:has-text("Submit")');

    await expect(page.locator("text=Comment cannot be empty")).toBeVisible();
  });

  test("deletes own comment", async ({ page }) => {
    await page.goto("/");

    // Open comments
    await page.locator('button[aria-label="Comment"]').first().click();

    // Add comment
    await page.fill('textarea[name="comment"]', "Test comment");
    await page.click('button:has-text("Submit")');

    // Delete comment
    await page.locator('button[aria-label="Delete comment"]').click();
    await page.click('button:has-text("Confirm")');

    // Comment should be gone
    await expect(page.locator("text=Test comment")).toBeHidden();
  });

  test("displays comment count", async ({ page }) => {
    await page.goto("/");

    const commentButton = page.locator('button[aria-label="Comment"]').first();
    const countText = await commentButton.locator("span").textContent();

    expect(parseInt(countText || "0")).toBeGreaterThanOrEqual(0);
  });
});
```

### Test File: `e2e/interactions/save-post.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Save Post", () => {
  test("saves a post", async ({ page }) => {
    await page.goto("/");

    const saveButton = page.locator('button[aria-label="Save"]').first();
    await saveButton.click();

    // Should show unsave button
    await expect(
      page.locator('button[aria-label="Unsave"]').first(),
    ).toBeVisible();
  });

  test("unsaves a saved post", async ({ page }) => {
    await page.goto("/");

    // Save first
    await page.locator('button[aria-label="Save"]').first().click();

    // Unsave
    await page.locator('button[aria-label="Unsave"]').first().click();

    // Should show save button again
    await expect(
      page.locator('button[aria-label="Save"]').first(),
    ).toBeVisible();
  });

  test("toggles save state correctly", async ({ page }) => {
    await page.goto("/");

    const saveButton = page.locator('button[aria-label="Save"]').first();

    // Save
    await saveButton.click();
    await expect(
      page.locator('button[aria-label="Unsave"]').first(),
    ).toBeVisible();

    // Unsave
    await page.locator('button[aria-label="Unsave"]').first().click();
    await expect(
      page.locator('button[aria-label="Save"]').first(),
    ).toBeVisible();
  });

  test("saved posts appear in saved tab", async ({ page }) => {
    await page.goto("/");

    // Save a post
    await page.locator('button[aria-label="Save"]').first().click();

    // Go to saved tab
    await page.click('a[href="/saved"]');

    // Post should appear
    await expect(
      page.locator('[data-testid="post-item"]').first(),
    ).toBeVisible();
  });
});
```

## Acceptance Criteria

- [ ] `e2e/interactions/like-post.spec.ts` has 3 test cases
- [ ] `e2e/interactions/comment.spec.ts` has 4 test cases
- [ ] `e2e/interactions/save-post.spec.ts` has 4 test cases
- [ ] All interaction tests pass locally
