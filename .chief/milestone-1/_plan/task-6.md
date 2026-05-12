# Task 6: Write E2E Tests for Post Management

## Goal Reference

- `e2e-test-coverage.md` - Post management tested

## Contract Reference

- `e2e-test-spec.md` - Post management test scenarios

## Work Description

### Create Test Directory Structure

```
e2e/
├── posts/
│   ├── create-post.spec.ts
│   ├── view-feed.spec.ts
│   ├── delete-post.spec.ts
│   └── edit-post.spec.ts
```

### Test File: `e2e/posts/create-post.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Create Post", () => {
  test("creates text post successfully", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Create Post")');
    await page.fill('textarea[name="content"]', "Hello World!");
    await page.click('button:has-text("Post")');

    await expect(page.locator("text=Hello World!")).toBeVisible();
  });

  test("shows validation error for empty content", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Create Post")');
    await page.click('button:has-text("Post")');

    await expect(page.locator("text=Content is required")).toBeVisible();
  });

  test("creates post with image", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Create Post")');
    await page.fill('textarea[name="content"]', "Check out this image");

    // Upload image (requires file input)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("test-image.jpg");

    await page.click('button:has-text("Post")');
    await expect(page.locator('img[alt="Post image"]')).toBeVisible();
  });
});
```

### Test File: `e2e/posts/view-feed.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("View Feed", () => {
  test("displays posts in feed", async ({ page }) => {
    await page.goto("/");

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-item"]');
    const posts = await page.locator('[data-testid="post-item"]').count();
    expect(posts).toBeGreaterThan(0);
  });

  test("loads more posts on scroll (infinite scroll)", async ({ page }) => {
    await page.goto("/");

    const initialCount = await page
      .locator('[data-testid="post-item"]')
      .count();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const newCount = await page.locator('[data-testid="post-item"]').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test("shows loading state while fetching", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("text=Loading...")).toBeVisible();
    await expect(page.locator("text=Loading...")).toBeHidden({
      timeout: 10000,
    });
  });
});
```

### Test File: `e2e/posts/delete-post.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Delete Post", () => {
  test("deletes own post successfully", async ({ page }) => {
    await page.goto("/");

    // Create a post first
    await page.click('button:has-text("Create Post")');
    await page.fill('textarea[name="content"]', "Post to delete");
    await page.click('button:has-text("Post")');

    // Delete the post
    await page.click('button[aria-label="Delete post"]');
    await page.click('button:has-text("Confirm")');

    await expect(page.locator("text=Post to delete")).toBeHidden();
  });

  test("cannot delete other user posts", async ({ page }) => {
    await page.goto("/");

    // Try to find delete button on another user's post
    const otherUserPost = page.locator('[data-testid="post-item"]').first();
    const deleteButton = otherUserPost.locator(
      'button[aria-label="Delete post"]',
    );

    // Delete button should not exist or should be disabled
    await expect(deleteButton).toHaveCount(0);
  });
});
```

### Test File: `e2e/posts/edit-post.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Edit Post", () => {
  test("edits own post successfully", async ({ page }) => {
    await page.goto("/");

    // Click edit on own post
    await page.click('button[aria-label="Edit post"]');

    // Update content
    await page.fill('textarea[name="content"]', "Updated content");
    await page.click('button:has-text("Save")');

    await expect(page.locator("text=Updated content")).toBeVisible();
  });

  test("cancels edit without saving", async ({ page }) => {
    await page.goto("/");

    // Open edit modal
    await page.click('button[aria-label="Edit post"]');

    // Cancel
    await page.click('button:has-text("Cancel")');

    // Original content should still be visible
    await expect(page.locator("text=Original content")).toBeVisible();
  });
});
```

## Acceptance Criteria

- [ ] `e2e/posts/create-post.spec.ts` has 3 test cases
- [ ] `e2e/posts/view-feed.spec.ts` has 3 test cases
- [ ] `e2e/posts/delete-post.spec.ts` has 2 test cases
- [ ] `e2e/posts/edit-post.spec.ts` has 2 test cases
- [ ] All post tests pass locally
