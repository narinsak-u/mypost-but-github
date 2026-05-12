# Contract: Unit Test Specification

## Dependencies

- `testing-setup.md`

## Test Structure

### Directory Layout

```
hooks/__tests__/
  ├── use-get-posts.test.ts
  ├── use-create-post.test.ts
  ├── use-delete-post.test.ts
  ├── use-toggle-post.test.ts
  ├── use-get-user.test.ts
  ├── use-get-saved-count.test.ts
  ├── use-post-count.test.ts
  └── use-parse-content.test.ts

lib/__tests__/
  └── utils.test.ts

store/__tests__/
  ├── use-saved-tab.test.ts
  ├── use-post-modal.test.ts
  └── use-option-modal.test.ts
```

## Test Requirements

### Hooks (`hooks/`)

| Hook               | Test Scenarios                                     |
| ------------------ | -------------------------------------------------- |
| `useGetPosts`      | initial state, loading, success, error, pagination |
| `useCreatePost`    | success, error handling, invalid input             |
| `useDeletePost`    | success, error, optimistic update                  |
| `useTogglePost`    | like/unlike toggle, error handling                 |
| `useGetUser`       | success, not found, error                          |
| `useGetSavedCount` | success, error                                     |
| `usePostCount`     | success, error                                     |
| `useParseContent`  | parses mentions, parses hashtags, empty content    |

### Utils (`lib/`)

| Function       | Test Scenarios                                        |
| -------------- | ----------------------------------------------------- |
| `cn()`         | merges classes correctly, handles conditional classes |
| `formatDate()` | different date formats, relative time                 |
| `truncate()`   | truncation at word boundary, no truncation needed     |

### Stores (`store/`)

| Store            | Test Scenarios            |
| ---------------- | ------------------------- |
| `useSavedTab`    | toggle, persistence       |
| `usePostModal`   | open/close, set post data |
| `useOptionModal` | open/close, set options   |

## Mock Requirements

- Mock `@tanstack/react-query` for hook tests
- Mock `axios` or internal API calls
- Mock Zustand stores with initial state

## Coverage Target

- **Minimum**: 70% line coverage
- **Measured by**: `npm run test:unit:coverage`

## Acceptance Criteria

- [ ] All hooks in `/hooks/` have at least one test file
- [ ] `lib/utils.ts` functions have tests
- [ ] All Zustand stores have tests
- [ ] Coverage threshold enforced (fail if <70%)
- [ ] Tests pass on CI
