# Contract: E2E Test Specification

## Dependencies

- `testing-setup.md`

## Test Structure

### Directory Layout

```
e2e/
├── auth/
│   ├── sign-up.spec.ts
│   ├── sign-in.spec.ts
│   └── sign-out.spec.ts
├── posts/
│   ├── create-post.spec.ts
│   ├── view-feed.spec.ts
│   ├── delete-post.spec.ts
│   └── edit-post.spec.ts
├── interactions/
│   ├── like-post.spec.ts
│   ├── comment.spec.ts
│   └── save-post.spec.ts
└── profile/
    ├── view-profile.spec.ts
    └── edit-profile.spec.ts
```

## Test Scenarios

### Auth Flow

| Test               | Validations                                           |
| ------------------ | ----------------------------------------------------- |
| `sign-up.spec.ts`  | Create account, validation errors, redirect to home   |
| `sign-in.spec.ts`  | Login success, wrong password error, session persists |
| `sign-out.spec.ts` | Clear session, redirect to login                      |

### Post Management

| Test                  | Validations                                            |
| --------------------- | ------------------------------------------------------ |
| `create-post.spec.ts` | Create text post, create with image, validation errors |
| `view-feed.spec.ts`   | Posts render, infinite scroll works                    |
| `delete-post.spec.ts` | Delete own post, cannot delete others' posts           |
| `edit-post.spec.ts`   | Edit own post, save changes                            |

### Interactions

| Test                | Validations                           |
| ------------------- | ------------------------------------- |
| `like-post.spec.ts` | Like toggles correctly, count updates |
| `comment.spec.ts`   | Add comment, delete own comment       |
| `save-post.spec.ts` | Save/unsave toggles correctly         |

### Profile

| Test                   | Validations                |
| ---------------------- | -------------------------- |
| `view-profile.spec.ts` | Profile loads, shows posts |
| `edit-profile.spec.ts` | Update name, update bio    |

## Test Configuration

- **Base URL**: `http://localhost:3000`
- **Timeout**: 30s per test
- **Retries**: 2 on CI
- **Parallelism**: 3 workers locally, 2 on CI

## Fixtures

- `test-user`: Pre-created user for tests
- `auth-fixture`: Session management

## Acceptance Criteria

- [ ] All test files in `e2e/` exist and pass
- [ ] Tests run in CI on every PR
- [ ] Playwright HTML report generated
- [ ] No flaky tests (retry <10% failure rate)
