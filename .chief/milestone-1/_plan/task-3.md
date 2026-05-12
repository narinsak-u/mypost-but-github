# Task 3: Write Unit Tests for Custom Hooks

## Goal Reference

- `unit-test-coverage.md` - All custom hooks tested

## Contract Reference

- `unit-test-spec.md` - Hook test scenarios

## Work Description

### Create Test Directory Structure

```
hooks/__tests__/
```

### Test Files to Create

#### 1. `hooks/__tests__/use-get-posts.test.ts`

Test scenarios:

- Initial state: isLoading true, data undefined
- Loading state
- Success state with data
- Error state
- Pagination behavior (hasNextPage, fetchNextPage)

#### 2. `hooks/__tests__/use-create-post.test.ts`

Test scenarios:

- Success: creates post, invalidates queries
- Error: handles API error
- Loading state while creating

#### 3. `hooks/__tests__/use-delete-post.test.ts`

Test scenarios:

- Success: deletes post, optimistic update
- Error: reverts optimistic update
- Cannot delete other user's posts (403)

#### 4. `hooks/__tests__/use-toggle-post.test.ts`

Test scenarios:

- Like post (adds like)
- Unlike post (removes like)
- Error handling
- Optimistic update

#### 5. `hooks/__tests__/use-get-user.test.ts`

Test scenarios:

- Success: returns user data
- User not found (404)
- Error handling

#### 6. `hooks/__tests__/use-get-saved-count.test.ts`

Test scenarios:

- Success: returns saved count
- Error handling

#### 7. `hooks/__tests__/use-post-count.test.ts`

Test scenarios:

- Success: returns post count
- Error handling

#### 8. `hooks/__tests__/use-parse-content.test.ts`

Test scenarios:

- Parses @mentions to links
- Parses #hashtags to links
- Returns empty string for empty input
- Preserves plain text

### Testing Pattern

Use `@tanstack/react-query` devtools or mock the query client:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetPosts } from '../use-get-posts'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useGetPosts', () => {
  it('returns posts on success', async () => {
    const { result } = renderHook(() => useGetPosts({ limit: 10 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})
```

## Acceptance Criteria

- [ ] 8 test files created in `hooks/__tests__/`
- [ ] Each hook has at least 3 test cases
- [ ] All tests pass (`npm run test:unit`)
- [ ] No console errors during tests
