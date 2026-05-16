# Testing Infrastructure Design

**Date:** 2026-05-16
**Status:** Draft
**Author:** opencode

## Summary

Add comprehensive testing infrastructure to mypost-but-github using Vitest (unit + integration) and Playwright (E2E) with GitHub Actions CI that blocks merges on test failures. Focus on server actions first for highest ROI, targeting ~60-70% coverage on critical paths.

## Architecture

### Test Pyramid

```
         /\
        /E2E\        Playwright (~10 tests, 15 min CI)
       /------\
      /Integration\  Vitest + real DB (~15 tests, 10 min CI)
     /--------------\
    /    Unit Tests   \  Vitest + mocks (~25 tests, 1 min CI)
   /------------------\
```

### Directory Structure

```
tests/
├── unit/
│   ├── actions/          # Server actions with mocked dependencies
│   ├── hooks/            # Custom React hooks
│   └── store/            # Zustand stores
├── integration/
│   └── actions/          # Server actions with real Prisma queries
├── e2e/
│   ├── auth.spec.ts      # Login, session, logout
│   ├── posts.spec.ts     # Create, edit, delete, like, tag
│   ├── comments.spec.ts  # Add, delete comments
│   ├── profiles.spec.ts  # Visit profile, follow/unfollow
│   ├── chat.spec.ts      # Open chat, send/receive messages
│   └── search.spec.ts    # Search posts, empty state
└── fixtures/
    ├── auth.ts           # Mock session factories
    ├── db.ts             # Test DB setup/teardown helpers
    ├── posts.ts          # Test data factories
    └── playwright.ts     # E2E auth helpers, page objects
```

### Config Files

- `vitest.config.ts` — Enhanced with coverage thresholds, test directories
- `playwright.config.ts` — New, Chromium only, CI mode with retries
- `.github/workflows/test.yml` — CI pipeline with 3 parallel jobs

## Server Action Testing Strategy

### Unit Tests

**Pattern:** Mock all external dependencies (Prisma, auth, next/cache, next/headers). Test logic branches only.

**Test cases per action:**

1. Auth guard: no session → `{ error: "Unauthorized" }`
2. Validation: empty/invalid input → `{ error: "Missing required fields" }`
3. Business logic: valid input → correct result
4. Error handling: DB throws → `{ error: "Internal server error" }`

**Mocking pattern:**

```typescript
vi.mock('@/lib/prismadb', () => ({
  db: {
    post: { create: vi.fn(), findUnique: vi.fn(), ... },
    comment: { create: vi.fn(), ... },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }));
```

### Integration Tests

**Pattern:** Minimal mocking. Use real Prisma against a test MongoDB instance.

**Flow per test:**

1. Seed test data via Prisma
2. Call real server action (only mock auth session)
3. Assert DB state changes + return value
4. Clean up (truncate collections or use unique IDs)

**Requirements:**

- Separate test database via `DATABASE_URL_TEST` env var (MongoDB Atlas collection dedicated to tests)
- Test setup/teardown helpers in `tests/fixtures/db.ts`

### Priority Actions (in order)

1. `post-actions.ts` — createPost, toggleLike, deletePost
2. `comment-actions.ts` — addComment, deleteComment
3. `send-message.ts` — already has unit tests, add integration
4. `follow-actions.ts` — follow/unfollow
5. `search-posts-atlas.ts` — search with fallback

### Coverage Thresholds

Configured in `vitest.config.ts`:

- `branches: 50`
- `functions: 60`
- `lines: 60`
- `statements: 60`

Only count `actions/` and `lib/` directories. Skip `app/`, `components/`, `ui/`, `providers/`, `store/`.

## E2E Testing Strategy

### Playwright Configuration

- **Browser:** Chromium only
- **Base URL:** `http://localhost:3000`
- **Retries:** 2 in CI, 0 locally
- **Failure handling:** Screenshot + trace on failure
- **Test isolation:** Each test starts fresh (clear storage/cookies)

### Test Flows (~10 tests)

| File               | Tests | Description                                            |
| ------------------ | ----- | ------------------------------------------------------ |
| `auth.spec.ts`     | 1     | Google/GitHub login → session persists → logout        |
| `posts.spec.ts`    | 3     | Create post → appears in feed → edit → delete          |
| `posts.spec.ts`    | 1     | Like/unlike → counter updates                          |
| `posts.spec.ts`    | 1     | Post with tags → filter by tag                         |
| `comments.spec.ts` | 1     | Add comment → appears under post → delete              |
| `profiles.spec.ts` | 1     | Visit user profile → see their posts → follow/unfollow |
| `chat.spec.ts`     | 1     | Open chat → send message → receive reply               |
| `search.spec.ts`   | 1     | Search query → results match → empty state             |

### Auth Handling

Use `storageState` to save authenticated session once, reuse across tests. Login via UI tested once in `auth.spec.ts`, then reuse saved state for speed.

### NPM Scripts

```json
{
  "test": "vitest",
  "test:unit": "vitest run tests/unit",
  "test:integration": "vitest run tests/integration",
  "test:e2e": "playwright test --ui",
  "test:e2e:ci": "playwright test",
  "test:coverage": "vitest run --coverage",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e:ci"
}
```

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

**Triggers:**

- `push` to `main` and `dev`
- `pull_request` to `main`

### Parallel Jobs

| Job                 | Timeout | Notes                                           |
| ------------------- | ------- | ----------------------------------------------- |
| `unit-tests`        | 5 min   | Vitest with coverage, fails if below threshold  |
| `integration-tests` | 10 min  | Requires `DATABASE_URL_TEST` MongoDB connection |
| `e2e-tests`         | 15 min  | Builds app, starts server, runs Playwright      |

### Fail-Fast Behavior

- All jobs must pass for PR to merge (enforced via GitHub branch protection)
- Unit tests provide fastest feedback (~30s)
- Integration tests run in parallel with unit
- E2E runs last (slowest, ~2-3 min including build)

### Environment Setup

- Node 20 LTS
- MongoDB Atlas test database (`DATABASE_URL_TEST` env var)
- Better Auth secret (random string for CI)
- Playwright browsers cached via GitHub Actions cache

### Artifacts

- Coverage report uploaded as artifact (viewable in PR checks)
- Playwright HTML report uploaded on E2E failure for debugging

## Migration Plan

### Phase 1: Infrastructure Setup

1. Create `tests/` directory structure
2. Move existing `*.test.ts` files from `actions/`, `hooks/`, `store/` to `tests/unit/`
3. Enhance `vitest.config.ts` with coverage and test directories
4. Install Playwright, generate `playwright.config.ts`
5. Add NPM scripts to `package.json`

### Phase 2: Server Action Tests

1. Create test fixtures (`auth.ts`, `db.ts`, `posts.ts`)
2. Write unit tests for priority actions (post-actions, comment-actions, etc.)
3. Write integration tests for priority actions
4. Verify coverage thresholds pass

### Phase 3: E2E Tests

1. Set up Playwright auth helpers with `storageState`
2. Write E2E tests for core flows (auth, posts, comments)
3. Write E2E tests for remaining flows (profiles, chat, search)

### Phase 4: CI Integration

1. Create `.github/workflows/test.yml`
2. Configure branch protection rules
3. Verify CI runs successfully on PR

## Dependencies

### New Dev Dependencies

- `@playwright/test` — E2E testing framework
- `@vitest/coverage-v8` — Coverage reporting (default for Vitest 4.x)

### Environment Variables (CI)

- `DATABASE_URL_TEST` — MongoDB connection string for test database
- `BETTER_AUTH_SECRET` — Random string for CI auth sessions
- `BETTER_AUTH_URL` — `http://localhost:3000` for CI
