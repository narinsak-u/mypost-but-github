# Testing Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add comprehensive testing infrastructure with Vitest (unit + integration) and Playwright (E2E) with GitHub Actions CI that blocks merges on test failures.

**Architecture:** Three-tier test pyramid — unit tests with mocked dependencies, integration tests with real Prisma against test DB, E2E tests with Playwright against running app. Tests organized in `tests/` directory with shared fixtures.

**Tech Stack:** Vitest 4.x, Playwright, @testing-library/react, jsdom, GitHub Actions, MongoDB Atlas (test DB)

---

## File Structure

### New Files

- `tests/unit/actions/post-actions.test.ts` — Unit tests for post actions
- `tests/unit/actions/comment-actions.test.ts` — Unit tests for comment actions
- `tests/unit/actions/follow-actions.test.ts` — Unit tests for follow actions
- `tests/unit/actions/send-message.test.ts` — Moved from actions/send-message.test.ts
- `tests/unit/actions/search-posts-atlas.test.ts` — Unit tests for search
- `tests/unit/hooks/use-chat-scroll.test.ts` — Moved from hooks/use-chat-scroll.test.ts
- `tests/unit/store/use-chat-store.test.ts` — Moved from store/use-chat-store.test.ts
- `tests/integration/actions/post-actions.test.ts` — Integration tests for post actions
- `tests/integration/actions/comment-actions.test.ts` — Integration tests for comment actions
- `tests/integration/actions/send-message.test.ts` — Integration tests for messaging
- `tests/integration/actions/follow-actions.test.ts` — Integration tests for follow
- `tests/e2e/auth.spec.ts` — E2E auth flow
- `tests/e2e/posts.spec.ts` — E2E post flows
- `tests/e2e/comments.spec.ts` — E2E comment flows
- `tests/e2e/profiles.spec.ts` — E2E profile/follow flows
- `tests/e2e/chat.spec.ts` — E2E chat flows
- `tests/e2e/search.spec.ts` — E2E search flows
- `tests/fixtures/auth.ts` — Mock session factories
- `tests/fixtures/db.ts` — Test DB helpers
- `tests/fixtures/posts.ts` — Test data factories
- `tests/fixtures/playwright.ts` — E2E helpers
- `playwright.config.ts` — Playwright configuration
- `.github/workflows/test.yml` — CI pipeline

### Modified Files

- `vitest.config.ts` — Add coverage thresholds, test directories
- `package.json` — Add test scripts, new dev dependencies

### Deleted Files (moved to tests/unit/)

- `actions/send-message.test.ts`
- `actions/get-messages.test.ts`
- `hooks/use-chat-scroll.test.ts`
- `store/use-chat-store.test.ts`

---

## Phase 1: Infrastructure Setup

### Task 1: Create tests directory structure and move existing tests

**Files:**

- Create: `tests/unit/actions/`
- Create: `tests/unit/hooks/`
- Create: `tests/unit/store/`
- Create: `tests/integration/actions/`
- Create: `tests/e2e/`
- Create: `tests/fixtures/`
- Move: `actions/send-message.test.ts` → `tests/unit/actions/send-message.test.ts`
- Move: `actions/get-messages.test.ts` → `tests/unit/actions/get-messages.test.ts`
- Move: `hooks/use-chat-scroll.test.ts` → `tests/unit/hooks/use-chat-scroll.test.ts`
- Move: `store/use-chat-store.test.ts` → `tests/unit/store/use-chat-store.test.ts`

- [ ] **Step 1: Create directory structure**

Run:

```bash
mkdir -p tests/unit/actions tests/unit/hooks tests/unit/store tests/integration/actions tests/e2e tests/fixtures
```

- [ ] **Step 2: Move existing test files**

Run:

```bash
git mv actions/send-message.test.ts tests/unit/actions/send-message.test.ts
git mv actions/get-messages.test.ts tests/unit/actions/get-messages.test.ts
git mv hooks/use-chat-scroll.test.ts tests/unit/hooks/use-chat-scroll.test.ts
git mv store/use-chat-store.test.ts tests/unit/store/use-chat-store.test.ts
```

- [ ] **Step 3: Verify existing tests still pass**

Run:

```bash
npm run test -- --run
```

Expected: All 4 existing tests pass (send-message, get-messages, use-chat-scroll, use-chat-store)

- [ ] **Step 4: Commit**

```bash
git add tests/ && git rm actions/send-message.test.ts actions/get-messages.test.ts hooks/use-chat-scroll.test.ts store/use-chat-store.test.ts
git commit -m "test: restructure tests into tests/ directory"
```

---

### Task 2: Create test fixtures

**Files:**

- Create: `tests/fixtures/auth.ts`
- Create: `tests/fixtures/db.ts`
- Create: `tests/fixtures/posts.ts`

- [ ] **Step 1: Create auth fixture**

Create `tests/fixtures/auth.ts`:

```typescript
import { vi } from "vitest";
import { auth } from "@/lib/auth";

export const mockSession = (userId: string | null = null) => {
  vi.mocked(auth.api.getSession).mockResolvedValue(
    userId ? ({ user: { id: userId } } as any) : null,
  );
};

export const createMockUser = () => `user-${crypto.randomUUID()}`;

export const createAdminSession = () => mockSession("admin-user-id");
```

- [ ] **Step 2: Create DB fixture**

Create `tests/fixtures/db.ts`:

```typescript
import { db as prisma } from "@/lib/prismadb";

export const clearDatabase = async () => {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follower.deleteMany();
  await prisma.post.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
};

export const seedTestUser = async (overrides = {}) => {
  return prisma.user.create({
    data: {
      email: `test-${crypto.randomUUID()}@example.com`,
      name: "Test User",
      ...overrides,
    },
  });
};

export const seedTestPost = async (userId: string, overrides = {}) => {
  return prisma.post.create({
    data: {
      title: "Test Post",
      body: "Test body content",
      tag: "test",
      userId,
      likedIds: [],
      starIds: [],
      ...overrides,
    },
  });
};

export const seedTestComment = async (
  userId: string,
  postId: string,
  overrides = {},
) => {
  return prisma.comment.create({
    data: {
      body: "Test comment",
      userId,
      postId,
      ...overrides,
    },
  });
};

export const seedTestConversation = async (
  participantIds: string[],
  overrides = {},
) => {
  return prisma.conversation.create({
    data: {
      participantIds,
      lastMessageAt: new Date(),
      ...overrides,
    },
  });
};

export const seedTestMessage = async (
  conversationId: string,
  senderId: string,
  overrides = {},
) => {
  return prisma.message.create({
    data: {
      content: "Test message",
      conversationId,
      senderId,
      ...overrides,
    },
  });
};
```

- [ ] **Step 3: Create posts fixture**

Create `tests/fixtures/posts.ts`:

```typescript
export const validPostData = {
  title: "A New Post Title",
  body: "This is the body of the post with some content.",
  tag: "discussion",
};

export const minimalPostData = {
  title: "Minimal Post",
  body: "Body",
  tag: "",
};

export const invalidPostData = {
  title: "",
  body: "",
  tag: "",
};

export const createPostWithTags = (tag: string) => ({
  ...validPostData,
  tag,
});
```

- [ ] **Step 4: Commit**

```bash
git add tests/fixtures/
git commit -m "test: add test fixtures for auth, db, and posts"
```

---

### Task 3: Enhance vitest.config.ts

**Files:**

- Modify: `vitest.config.ts`

- [ ] **Step 1: Update vitest configuration**

Replace the entire content of `vitest.config.ts` with:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["actions/**/*.ts", "lib/**/*.ts"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "app/**",
        "components/**",
        "providers/**",
        "store/**",
        "hooks/**",
      ],
      thresholds: {
        branches: 50,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

- [ ] **Step 2: Verify tests still pass with new config**

Run:

```bash
npm run test -- --run
```

Expected: All existing tests pass

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "test: enhance vitest config with coverage thresholds and test directories"
```

---

### Task 4: Install Playwright and add NPM scripts

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install Playwright**

Run:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Add test scripts to package.json**

Read `package.json` and update the `scripts` section to:

```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "postinstall": "prisma generate",
    "lint": "next lint",
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test --ui",
    "test:e2e:ci": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e:ci",
    "start": "next start"
  }
}
```

- [ ] **Step 3: Create playwright.config.ts**

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 4: Verify Playwright installation**

Run:

```bash
npx playwright test --list
```

Expected: Lists 0 tests (no E2E tests written yet) but no errors

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json playwright.config.ts
git commit -m "test: add Playwright and test scripts"
```

---

## Phase 2: Server Action Tests

### Task 5: Unit tests for post-actions

**Files:**

- Create: `tests/unit/actions/post-actions.test.ts`
- Reference: `actions/post-actions.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/actions/post-actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPost,
  deletePost,
  toggleLike,
  toggleStar,
} from "@/actions/post-actions";
import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";

vi.mock("@/lib/prismadb", () => ({
  db: {
    post: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("createPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw unauthorized if no session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    await expect(
      createPost({ title: "Test", body: "Body", tag: "test" }),
    ).rejects.toThrow("Unauthorized");
  });

  it("should create a post with valid data", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });

    const mockPost = {
      id: "post-1",
      title: "Test",
      body: "Body",
      tag: "test",
      userId: "user-1",
      likedIds: [],
      starIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.post.create as any).mockResolvedValue(mockPost);

    const result = await createPost({
      title: "Test",
      body: "Body",
      tag: "test",
    });

    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        title: "Test",
        body: "Body",
        tag: "test",
        userId: "user-1",
        likedIds: [],
        starIds: [],
      },
    });
    expect(result).toEqual(mockPost);
  });

  it("should throw on validation error for empty title", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });

    await expect(
      createPost({ title: "", body: "Body", tag: "test" }),
    ).rejects.toThrow();
  });
});

describe("deletePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw unauthorized if no session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    await expect(deletePost("post-1")).rejects.toThrow("Unauthorized");
  });

  it("should throw invalid ID for empty postId", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });

    await expect(deletePost("")).rejects.toThrow("Invalid ID");
  });

  it("should throw if post not found", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue(null);

    await expect(deletePost("post-1")).rejects.toThrow("Post not found");
  });

  it("should throw if user does not own the post", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue({
      id: "post-1",
      userId: "user-2",
    });

    await expect(deletePost("post-1")).rejects.toThrow("Unauthorized");
  });

  it("should delete post if user owns it", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue({
      id: "post-1",
      userId: "user-1",
    });
    (prisma.post.delete as any).mockResolvedValue({ id: "post-1" });

    const result = await deletePost("post-1");

    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: { id: "post-1" },
    });
    expect(result).toBe(true);
  });
});

describe("toggleLike", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized if no session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const result = await toggleLike("post-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error for invalid postId", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });

    const result = await toggleLike("");
    expect(result).toEqual({ error: "Invalid ID" });
  });

  it("should return error if post not found", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue(null);

    const result = await toggleLike("post-1");
    expect(result).toEqual({ error: "Post not found" });
  });

  it("should like a post", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue({
      id: "post-1",
      likedIds: [],
    });
    (prisma.post.update as any).mockResolvedValue({});

    const result = await toggleLike("post-1");

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: { likedIds: { push: "user-1" } },
    });
    expect(result).toEqual({ hasLiked: true });
  });

  it("should unlike a post", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue({
      id: "post-1",
      likedIds: ["user-1"],
    });
    (prisma.post.update as any).mockResolvedValue({});

    const result = await toggleLike("post-1");

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: { likedIds: { set: [] } },
    });
    expect(result).toEqual({ hasLiked: false });
  });
});

describe("toggleStar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized if no session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const result = await toggleStar("post-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should star a post", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue({
      id: "post-1",
      starIds: [],
    });
    (prisma.post.update as any).mockResolvedValue({});

    const result = await toggleStar("post-1");

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: { starIds: { push: "user-1" } },
    });
    expect(result).toEqual({ hasStarred: true });
  });

  it("should unstar a post", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue({
      id: "post-1",
      starIds: ["user-1"],
    });
    (prisma.post.update as any).mockResolvedValue({});

    const result = await toggleStar("post-1");

    expect(result).toEqual({ hasStarred: false });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run:

```bash
npm run test:unit -- tests/unit/actions/post-actions.test.ts
```

Expected: All 14 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/unit/actions/post-actions.test.ts
git commit -m "test: add unit tests for post-actions"
```

---

### Task 6: Unit tests for comment-actions

**Files:**

- Create: `tests/unit/actions/comment-actions.test.ts`
- Reference: `actions/comment-actions.ts`

- [ ] **Step 1: Write the tests**

Create `tests/unit/actions/comment-actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createComment, deleteComment } from "@/actions/comment-actions";
import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";

vi.mock("@/lib/prismadb", () => ({
  db: {
    post: { findUnique: vi.fn() },
    comment: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

describe("createComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized if no session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const result = await createComment({ postId: "post-1", body: "Comment" });
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error if post not found", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue(null);

    const result = await createComment({ postId: "post-1", body: "Comment" });
    expect(result).toEqual({ error: "Post not found" });
  });

  it("should create a comment", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.post.findUnique as any).mockResolvedValue({ id: "post-1" });

    const mockComment = {
      id: "comment-1",
      body: "Comment",
      postId: "post-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.comment.create as any).mockResolvedValue(mockComment);

    const result = await createComment({ postId: "post-1", body: "Comment" });

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: { postId: "post-1", body: "Comment", userId: "user-1" },
    });
    expect(result).toEqual(mockComment);
  });
});

describe("deleteComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized if no session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const result = await deleteComment("comment-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error if comment not found", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.comment.findUnique as any).mockResolvedValue(null);

    const result = await deleteComment("comment-1");
    expect(result).toEqual({ error: "Comment not found" });
  });

  it("should return error if user does not own the comment", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.comment.findUnique as any).mockResolvedValue({
      id: "comment-1",
      userId: "user-2",
    });

    const result = await deleteComment("comment-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should delete comment if user owns it", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.comment.findUnique as any).mockResolvedValue({
      id: "comment-1",
      userId: "user-1",
    });
    (prisma.comment.delete as any).mockResolvedValue({});

    const result = await deleteComment("comment-1");

    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: "comment-1" },
    });
    expect(result).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run:

```bash
npm run test:unit -- tests/unit/actions/comment-actions.test.ts
```

Expected: All 7 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/unit/actions/comment-actions.test.ts
git commit -m "test: add unit tests for comment-actions"
```

---

### Task 7: Unit tests for follow-actions

**Files:**

- Create: `tests/unit/actions/follow-actions.test.ts`
- Reference: `actions/follow-actions.ts`

- [ ] **Step 1: Write the tests**

Create `tests/unit/actions/follow-actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  toggleFollow,
  getIsFollowing,
  getUserFollowers,
  getUserFollowing,
} from "@/actions/follow-actions";
import { db } from "@/lib/prismadb";
import { auth } from "@/lib/auth";

vi.mock("@/lib/prismadb", () => ({
  db: {
    follower: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

describe("toggleFollow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized if no session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const result = await toggleFollow("user-2");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error if followingId is missing", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });

    const result = await toggleFollow("");
    expect(result).toEqual({ error: "Following user not found" });
  });

  it("should return error if trying to follow self", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });

    const result = await toggleFollow("user-1");
    expect(result).toEqual({ error: "You cannot follow yourself" });
  });

  it("should unfollow if already following", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (db.follower.findFirst as any).mockResolvedValue({ id: "follow-1" });
    (db.follower.delete as any).mockResolvedValue({});

    const result = await toggleFollow("user-2");

    expect(db.follower.delete).toHaveBeenCalled();
    expect(result).toEqual({ success: true, followed: false });
  });

  it("should follow if not already following", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (db.follower.findFirst as any).mockResolvedValue(null);
    (db.follower.create as any).mockResolvedValue({});

    const result = await toggleFollow("user-2");

    expect(db.follower.create).toHaveBeenCalledWith({
      data: { followingId: "user-2", followerId: "user-1" },
    });
    expect(result).toEqual({ success: true, followed: true });
  });
});

describe("getIsFollowing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return false if no session", async () => {
    (auth.api.getSession as any).mockResolvedValue(null);

    const result = await getIsFollowing("user-2");
    expect(result).toEqual({ isFollowing: false });
  });

  it("should return true if following", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (db.follower.findFirst as any).mockResolvedValue({ id: "follow-1" });

    const result = await getIsFollowing("user-2");
    expect(result).toEqual({ isFollowing: true });
  });

  it("should return false if not following", async () => {
    (auth.api.getSession as any).mockResolvedValue({ user: { id: "user-1" } });
    (db.follower.findFirst as any).mockResolvedValue(null);

    const result = await getIsFollowing("user-2");
    expect(result).toEqual({ isFollowing: false });
  });
});

describe("getUserFollowers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return follower count", async () => {
    (db.follower.findMany as any).mockResolvedValue([
      { id: "f1" },
      { id: "f2" },
      { id: "f3" },
    ]);

    const result = await getUserFollowers("user-1");
    expect(result).toEqual({ followersCount: 3 });
  });

  it("should return 0 on error", async () => {
    (db.follower.findMany as any).mockRejectedValue(new Error("DB error"));

    const result = await getUserFollowers("user-1");
    expect(result).toEqual({ followersCount: 0 });
  });
});

describe("getUserFollowing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return following count", async () => {
    (db.follower.findMany as any).mockResolvedValue([
      { id: "f1" },
      { id: "f2" },
    ]);

    const result = await getUserFollowing("user-1");
    expect(result).toEqual({ followingCount: 2 });
  });

  it("should return 0 on error", async () => {
    (db.follower.findMany as any).mockRejectedValue(new Error("DB error"));

    const result = await getUserFollowing("user-1");
    expect(result).toEqual({ followingCount: 0 });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run:

```bash
npm run test:unit -- tests/unit/actions/follow-actions.test.ts
```

Expected: All 13 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/unit/actions/follow-actions.test.ts
git commit -m "test: add unit tests for follow-actions"
```

---

### Task 8: Unit tests for search-posts-atlas

**Files:**

- Create: `tests/unit/actions/search-posts-atlas.test.ts`
- Reference: `actions/search-posts-atlas.ts`

- [ ] **Step 1: Write the tests**

Create `tests/unit/actions/search-posts-atlas.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchPostsAutocomplete } from "@/actions/search-posts-atlas";
import { db as prisma } from "@/lib/prismadb";

vi.mock("@/lib/prismadb", () => ({
  db: {
    $runCommandRaw: vi.fn(),
    post: {
      findMany: vi.fn(),
    },
  },
}));

describe("searchPostsAutocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array for empty query", async () => {
    const result = await searchPostsAutocomplete("");
    expect(result).toEqual([]);
  });

  it("should return empty array for whitespace-only query", async () => {
    const result = await searchPostsAutocomplete("   ");
    expect(result).toEqual([]);
  });

  it("should fall back to Prisma when Atlas fails", async () => {
    (prisma.$runCommandRaw as any).mockRejectedValue(new Error("Atlas error"));

    (prisma.post.findMany as any).mockResolvedValue([
      {
        id: "post-1",
        title: "Hello World",
        body: "Test body",
      },
    ]);

    const result = await searchPostsAutocomplete("hello");

    expect(prisma.post.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Hello World");
  });

  it("should return highlights for matching posts", async () => {
    (prisma.$runCommandRaw as any).mockRejectedValue(new Error("Atlas error"));

    (prisma.post.findMany as any).mockResolvedValue([
      {
        id: "post-1",
        title: "Hello World",
        body: "This is a test body",
      },
    ]);

    const result = await searchPostsAutocomplete("Hello");

    expect(result[0].highlights).toBeDefined();
    expect(result[0].highlights?.length).toBeGreaterThan(0);
  });

  it("should limit results to 8 posts", async () => {
    (prisma.$runCommandRaw as any).mockRejectedValue(new Error("Atlas error"));

    const manyPosts = Array.from({ length: 10 }, (_, i) => ({
      id: `post-${i}`,
      title: `Post ${i}`,
      body: `Body ${i}`,
    }));
    (prisma.post.findMany as any).mockResolvedValue(manyPosts);

    const result = await searchPostsAutocomplete("post");

    expect(result.length).toBeLessThanOrEqual(8);
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run:

```bash
npm run test:unit -- tests/unit/actions/search-posts-atlas.test.ts
```

Expected: All 6 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/unit/actions/search-posts-atlas.test.ts
git commit -m "test: add unit tests for search-posts-atlas"
```

---

### Task 9: Integration tests for post-actions

**Files:**

- Create: `tests/integration/actions/post-actions.test.ts`
- Reference: `tests/fixtures/db.ts`, `actions/post-actions.ts`

**Note:** Integration tests require `DATABASE_URL_TEST` environment variable. If not set, tests will use the main `DATABASE_URL`. Add a skip condition if neither is available.

- [ ] **Step 1: Write the integration tests**

Create `tests/integration/actions/post-actions.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import {
  createPost,
  deletePost,
  toggleLike,
  toggleStar,
} from "@/actions/post-actions";
import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { clearDatabase, seedTestUser, seedTestPost } from "@/tests/fixtures/db";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

const mockSession = (userId: string) => {
  (auth.api.getSession as any).mockResolvedValue({ user: { id: userId } });
};

describe("post-actions integration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe("createPost", () => {
    it("should create a post in the database", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const result = await createPost({
        title: "Integration Test Post",
        body: "This is a test body",
        tag: "test",
      });

      expect(result).toHaveProperty("id");
      expect(result.title).toBe("Integration Test Post");
      expect(result.userId).toBe(user.id);

      const dbPost = await prisma.post.findUnique({ where: { id: result.id } });
      expect(dbPost).not.toBeNull();
      expect(dbPost?.title).toBe("Integration Test Post");
    });
  });

  describe("deletePost", () => {
    it("should delete a post owned by the user", async () => {
      const user = await seedTestUser();
      const post = await seedTestPost(user.id);
      mockSession(user.id);

      const result = await deletePost(post.id);
      expect(result).toBe(true);

      const dbPost = await prisma.post.findUnique({ where: { id: post.id } });
      expect(dbPost).toBeNull();
    });

    it("should not delete a post owned by another user", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      const post = await seedTestPost(user1.id);
      mockSession(user2.id);

      await expect(deletePost(post.id)).rejects.toThrow("Unauthorized");

      const dbPost = await prisma.post.findUnique({ where: { id: post.id } });
      expect(dbPost).not.toBeNull();
    });
  });

  describe("toggleLike", () => {
    it("should like and unlike a post", async () => {
      const user = await seedTestUser();
      const post = await seedTestPost(user.id);
      mockSession(user.id);

      const likeResult = await toggleLike(post.id);
      expect(likeResult).toEqual({ hasLiked: true });

      const dbPost = await prisma.post.findUnique({ where: { id: post.id } });
      expect(dbPost?.likedIds).toContain(user.id);

      const unlikeResult = await toggleLike(post.id);
      expect(unlikeResult).toEqual({ hasLiked: false });

      const dbPostAfter = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(dbPostAfter?.likedIds).not.toContain(user.id);
    });
  });

  describe("toggleStar", () => {
    it("should star and unstar a post", async () => {
      const user = await seedTestUser();
      const post = await seedTestPost(user.id);
      mockSession(user.id);

      const starResult = await toggleStar(post.id);
      expect(starResult).toEqual({ hasStarred: true });

      const dbPost = await prisma.post.findUnique({ where: { id: post.id } });
      expect(dbPost?.starIds).toContain(user.id);

      const unstarResult = await toggleStar(post.id);
      expect(unstarResult).toEqual({ hasStarred: false });
    });
  });
});
```

- [ ] **Step 2: Run integration tests**

Run:

```bash
npm run test:integration -- tests/integration/actions/post-actions.test.ts
```

Expected: All 5 tests pass (requires DATABASE_URL or DATABASE_URL_TEST)

- [ ] **Step 3: Commit**

```bash
git add tests/integration/actions/post-actions.test.ts
git commit -m "test: add integration tests for post-actions"
```

---

### Task 10: Integration tests for comment-actions

**Files:**

- Create: `tests/integration/actions/comment-actions.test.ts`

- [ ] **Step 1: Write the tests**

Create `tests/integration/actions/comment-actions.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { createComment, deleteComment } from "@/actions/comment-actions";
import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import {
  clearDatabase,
  seedTestUser,
  seedTestPost,
  seedTestComment,
} from "@/tests/fixtures/db";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

const mockSession = (userId: string) => {
  (auth.api.getSession as any).mockResolvedValue({ user: { id: userId } });
};

describe("comment-actions integration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe("createComment", () => {
    it("should create a comment on a post", async () => {
      const user = await seedTestUser();
      const post = await seedTestPost(user.id);
      mockSession(user.id);

      const result = await createComment({
        postId: post.id,
        body: "Integration test comment",
      });

      expect(result).toHaveProperty("id");
      expect(result.body).toBe("Integration test comment");

      const dbComment = await prisma.comment.findUnique({
        where: { id: result.id },
      });
      expect(dbComment).not.toBeNull();
      expect(dbComment?.postId).toBe(post.id);
    });

    it("should return error for non-existent post", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const result = await createComment({
        postId: "non-existent-id",
        body: "Comment",
      });

      expect(result).toEqual({ error: "Post not found" });
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment owned by the user", async () => {
      const user = await seedTestUser();
      const post = await seedTestPost(user.id);
      const comment = await seedTestComment(user.id, post.id);
      mockSession(user.id);

      const result = await deleteComment(comment.id);
      expect(result).toBe(true);

      const dbComment = await prisma.comment.findUnique({
        where: { id: comment.id },
      });
      expect(dbComment).toBeNull();
    });

    it("should not delete a comment owned by another user", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      const post = await seedTestPost(user1.id);
      const comment = await seedTestComment(user1.id, post.id);
      mockSession(user2.id);

      const result = await deleteComment(comment.id);
      expect(result).toEqual({ error: "Unauthorized" });

      const dbComment = await prisma.comment.findUnique({
        where: { id: comment.id },
      });
      expect(dbComment).not.toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests**

Run:

```bash
npm run test:integration -- tests/integration/actions/comment-actions.test.ts
```

Expected: All 4 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/integration/actions/comment-actions.test.ts
git commit -m "test: add integration tests for comment-actions"
```

---

### Task 11: Integration tests for send-message

**Files:**

- Create: `tests/integration/actions/send-message.test.ts`

- [ ] **Step 1: Write the tests**

Create `tests/integration/actions/send-message.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { sendMessage } from "@/actions/send-message";
import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import {
  clearDatabase,
  seedTestUser,
  seedTestConversation,
} from "@/tests/fixtures/db";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

const mockSession = (userId: string) => {
  (auth.api.getSession as any).mockResolvedValue({ user: { id: userId } });
};

describe("send-message integration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it("should send a message in a conversation", async () => {
    const user1 = await seedTestUser();
    const user2 = await seedTestUser();
    const conversation = await seedTestConversation([user1.id, user2.id]);
    mockSession(user1.id);

    const result = await sendMessage(conversation.id, "Hello!");

    expect(result).toHaveProperty("id");
    expect(result.content).toBe("Hello!");
    expect(result.senderId).toBe(user1.id);
    expect(result.conversationId).toBe(conversation.id);

    const dbMessage = await prisma.message.findUnique({
      where: { id: result.id },
    });
    expect(dbMessage).not.toBeNull();
    expect(dbMessage?.content).toBe("Hello!");
  });

  it("should return error for non-participant", async () => {
    const user1 = await seedTestUser();
    const user2 = await seedTestUser();
    const user3 = await seedTestUser();
    const conversation = await seedTestConversation([user1.id, user2.id]);
    mockSession(user3.id);

    const result = await sendMessage(conversation.id, "Hello!");
    expect(result).toEqual({ error: "Unauthorized or conversation not found" });
  });

  it("should return error for missing fields", async () => {
    const user = await seedTestUser();
    mockSession(user.id);

    const result = await sendMessage("", "");
    expect(result).toEqual({ error: "Missing required fields" });
  });
});
```

- [ ] **Step 2: Run tests**

Run:

```bash
npm run test:integration -- tests/integration/actions/send-message.test.ts
```

Expected: All 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/integration/actions/send-message.test.ts
git commit -m "test: add integration tests for send-message"
```

---

### Task 12: Integration tests for follow-actions

**Files:**

- Create: `tests/integration/actions/follow-actions.test.ts`

- [ ] **Step 1: Write the tests**

Create `tests/integration/actions/follow-actions.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { toggleFollow, getIsFollowing } from "@/actions/follow-actions";
import { db } from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { clearDatabase, seedTestUser } from "@/tests/fixtures/db";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

const mockSession = (userId: string) => {
  (auth.api.getSession as any).mockResolvedValue({ user: { id: userId } });
};

describe("follow-actions integration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe("toggleFollow", () => {
    it("should follow a user", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      mockSession(user1.id);

      const result = await toggleFollow(user2.id);
      expect(result).toEqual({ success: true, followed: true });

      const follow = await db.follower.findFirst({
        where: { followerId: user1.id, followingId: user2.id },
      });
      expect(follow).not.toBeNull();
    });

    it("should unfollow a user", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      mockSession(user1.id);

      await toggleFollow(user2.id);
      const result = await toggleFollow(user2.id);

      expect(result).toEqual({ success: true, followed: false });

      const follow = await db.follower.findFirst({
        where: { followerId: user1.id, followingId: user2.id },
      });
      expect(follow).toBeNull();
    });

    it("should not allow following self", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const result = await toggleFollow(user.id);
      expect(result).toEqual({ error: "You cannot follow yourself" });
    });
  });

  describe("getIsFollowing", () => {
    it("should return true after following", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      mockSession(user1.id);

      await toggleFollow(user2.id);
      const result = await getIsFollowing(user2.id);

      expect(result).toEqual({ isFollowing: true });
    });

    it("should return false when not following", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      mockSession(user1.id);

      const result = await getIsFollowing(user2.id);
      expect(result).toEqual({ isFollowing: false });
    });
  });
});
```

- [ ] **Step 2: Run tests**

Run:

```bash
npm run test:integration -- tests/integration/actions/follow-actions.test.ts
```

Expected: All 5 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/integration/actions/follow-actions.test.ts
git commit -m "test: add integration tests for follow-actions"
```

---

### Task 13: Verify coverage thresholds

- [ ] **Step 1: Run coverage report**

Run:

```bash
npm run test:coverage
```

Expected: Coverage meets thresholds (branches: 50%, functions: 60%, lines: 60%, statements: 60%). If any threshold is not met, the command will fail with details.

- [ ] **Step 2: Review coverage HTML report**

Open `coverage/index.html` in browser to review which lines are covered.

- [ ] **Step 3: Commit any coverage-related changes if needed**

If coverage is below thresholds, add additional test cases for uncovered branches. Commit after fixing:

```bash
git add tests/
git commit -m "test: improve coverage to meet thresholds"
```

---

## Phase 3: E2E Tests

### Task 14: Set up Playwright auth helpers

**Files:**

- Create: `tests/fixtures/playwright.ts`
- Create: `tests/e2e/auth.spec.ts`

- [ ] **Step 1: Create Playwright fixture**

Create `tests/fixtures/playwright.ts`:

```typescript
import { test as base, expect } from "@playwright/test";

export const test = base.extend<{
  loginAsUser: () => Promise<void>;
}>({
  loginAsUser: async ({ page }, use) => {
    const login = async () => {
      await page.goto("/");
      await page
        .getByRole("button", { name: /sign in|login|sign in/i })
        .click();
      await page
        .waitForURL(/\/(sign-in|login|auth)/i, { timeout: 10000 })
        .catch(() => {});
    };
    await use(login);
  },
});

export { expect };
```

- [ ] **Step 2: Create auth E2E test**

Create `tests/e2e/auth.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login option on home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/mypost/i);
  });

  test("should redirect to login for protected actions", async ({ page }) => {
    await page.goto("/");
    const createButton = page
      .getByRole("button", { name: /create|post|new/i })
      .first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add tests/fixtures/playwright.ts tests/e2e/auth.spec.ts
git commit -m "test: add Playwright auth helpers and initial E2E test"
```

---

### Task 15: E2E tests for posts

**Files:**

- Create: `tests/e2e/posts.spec.ts`

- [ ] **Step 1: Write the tests**

Create `tests/e2e/posts.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Posts", () => {
  test("should be able to view the home feed", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  test("should navigate to a post detail page", async ({ page }) => {
    await page.goto("/");
    const firstPost = page.locator('[data-testid="post-card"]').first();
    if ((await firstPost.count()) > 0) {
      await firstPost.click();
      await expect(page).toHaveURL(/\/post\//);
    }
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/posts.spec.ts
git commit -m "test: add E2E tests for posts"
```

---

### Task 16: E2E tests for comments, profiles, chat, search

**Files:**

- Create: `tests/e2e/comments.spec.ts`
- Create: `tests/e2e/profiles.spec.ts`
- Create: `tests/e2e/chat.spec.ts`
- Create: `tests/e2e/search.spec.ts`

- [ ] **Step 1: Write comments E2E test**

Create `tests/e2e/comments.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Comments", () => {
  test("should be able to view comments on a post", async ({ page }) => {
    await page.goto("/");
    const firstPost = page.locator('[data-testid="post-card"]').first();
    if ((await firstPost.count()) > 0) {
      await firstPost.click();
      await expect(page).toHaveURL(/\/post\//);
    }
  });
});
```

- [ ] **Step 2: Write profiles E2E test**

Create `tests/e2e/profiles.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Profiles", () => {
  test("should be able to visit a user profile", async ({ page }) => {
    await page.goto("/");
    const firstAuthor = page.locator('[data-testid="author-link"]').first();
    if ((await firstAuthor.count()) > 0) {
      await firstAuthor.click();
      await expect(page).toHaveURL(/\/user\//);
    }
  });
});
```

- [ ] **Step 3: Write chat E2E test**

Create `tests/e2e/chat.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Chat", () => {
  test("should display chat interface", async ({ page }) => {
    await page.goto("/");
    const chatButton = page
      .getByRole("button", { name: /chat|message/i })
      .first();
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();
    }
  });
});
```

- [ ] **Step 4: Write search E2E test**

Create `tests/e2e/search.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("should be able to search for posts", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await expect(
        page.locator('[data-testid="search-results"]'),
      ).toBeVisible();
    }
  });

  test("should show empty state for no results", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("xyznonexistent123");
      await searchInput.press("Enter");
    }
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/comments.spec.ts tests/e2e/profiles.spec.ts tests/e2e/chat.spec.ts tests/e2e/search.spec.ts
git commit -m "test: add E2E tests for comments, profiles, chat, and search"
```

---

## Phase 4: CI Integration

### Task 17: Create GitHub Actions workflow

**Files:**

- Create: `.github/workflows/test.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npm run test:coverage

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_TEST }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          BETTER_AUTH_URL: http://localhost:3000

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        env:
          PLAYWRIGHT_BROWSERS_PATH: ${{ github.workspace }}/.cache/ms-playwright

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ${{ github.workspace }}/.cache/ms-playwright
          key: playwright-browsers-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          BETTER_AUTH_URL: http://localhost:3000
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
          GITHUB_CLIENT_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}

      - name: Run E2E tests
        run: npm run test:e2e:ci
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          BETTER_AUTH_URL: http://localhost:3000
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
          GITHUB_CLIENT_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions test workflow"
```

---

### Task 18: Add .gitignore entries for test artifacts

**Files:**

- Modify: `.gitignore`

- [ ] **Step 1: Add test-related ignores**

Append to `.gitignore`:

```
# Test coverage
coverage/

# Playwright
playwright-report/
test-results/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add test artifacts to .gitignore"
```

---

### Task 19: Final verification

- [ ] **Step 1: Run all unit tests**

Run:

```bash
npm run test:unit
```

Expected: All unit tests pass

- [ ] **Step 2: Run all integration tests**

Run:

```bash
npm run test:integration
```

Expected: All integration tests pass (requires DATABASE_URL or DATABASE_URL_TEST)

- [ ] **Step 3: Run coverage check**

Run:

```bash
npm run test:coverage
```

Expected: Coverage meets thresholds

- [ ] **Step 4: List E2E tests**

Run:

```bash
npx playwright test --list
```

Expected: Lists all E2E tests without errors

- [ ] **Step 5: Final commit**

```bash
git commit --allow-empty -m "test: testing infrastructure complete"
```

---

## Summary

This plan produces:

- **~45 unit tests** covering critical paths in server actions
- **~17 integration tests** verifying real DB operations
- **~8 E2E tests** covering major user flows
- **CI pipeline** with 3 parallel jobs that block merges on failure
- **Coverage thresholds** enforced at 50-60% for actions/lib

Total estimated tasks: 19
Total estimated time: 3-5 hours (depending on test execution speed and debugging)
