# Refactoring Plan: Consolidate Duplicate Mutation Hooks

## Problem Statement

The codebase contains multiple hooks with nearly identical mutation patterns:

- `hooks/use-like-post.ts` (149 lines)
- `hooks/use-save-post.ts` (154 lines)
- `hooks/use-delete-post.ts` (55 lines)
- `hooks/use-create-post.ts` (42 lines)

All follow the same structure:

1. Use `useMutation` from TanStack Query
2. Implement `onMutate` for optimistic updates
3. Implement `onError` for rollback
4. Implement `onSuccess` for cache invalidation
5. Return mutation function + loading state

This violates DRY principles and creates maintenance burden:

- Changes to optimistic update logic must be applied to 4+ files
- Inconsistent patterns between hooks (e.g., different invalidation predicates)
- No centralized query key management
- Typos in query keys (`"fetct-user"` instead of `"fetch-user"`)

## Goals

1. **Reduce code duplication** — Extract common mutation patterns into reusable primitives
2. **Improve maintainability** — Single place to update mutation logic
3. **Add type safety** — Centralized query key constants
4. **Better testability** — Test the generic hook, not each specific use case

## Proposed Architecture

### New Module: `hooks/use-mutation-utils.ts`

Create a shared module with:

1. **`createOptimisticMutation`** — Factory function that wraps TanStack Query mutations with standard optimistic update patterns
2. **Query key constants** — Centralized query key definitions
3. **Type-safe invalidation predicates** — Reusable cache invalidation logic

### Refactored Hooks

| Original             | Refactored                                                           |
| -------------------- | -------------------------------------------------------------------- |
| `use-like-post.ts`   | `useTogglePostField.ts` (params: field="likedIds", endpoint="/like") |
| `use-save-post.ts`   | `useTogglePostField.ts` (params: field="saveIds", endpoint="/save")  |
| `use-delete-post.ts` | `useDeletePost.ts` (keeps own logic, uses shared utilities)          |
| `use-create-post.ts` | `useCreatePost.ts` (keeps own logic, uses shared utilities)          |

## Implementation Steps

### Step 1: Create Query Key Constants (`hooks/keys.ts`)

```typescript
// Centralized query keys
export const queryKeys = {
  posts: {
    all: ["posts-query"] as const,
    detail: (id: string) => ["posts-query", id] as const,
    byUser: (userId: string) => ["posts-query", "user", userId] as const,
    saved: ["saved-posts"] as const,
  },
  users: {
    all: ["fetch-user-list"] as const, // Fix typo
    detail: (id: string) => ["fetch-user", id] as const,
  },
  counts: {
    saved: ["saved-count"] as const,
    posts: ["post-count"] as const,
  },
} as const;
```

### Step 2: Create Mutation Factory (`hooks/use-mutation-utils.ts`)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

type MutationConfig<TData, TVariables> = {
  endpoint: string;
  method: "post" | "delete";
  invalidateKeys?: readonly (string | number)[][];
  optimisticUpdate?: (variables: TVariables) => TData;
};

function createOptimisticMutation<TData, TVariables>({
  endpoint,
  method,
  invalidateKeys,
}: MutationConfig<TData, TVariables>) {
  return () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (variables: TVariables) => {
        const url = `/api/post/${variables.postId}${endpoint}`;
        const fn = method === "post" ? axios.post : axios.delete;
        await fn(url);
        return variables;
      },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: ["posts-query", variables.postId],
        });
        const previousData = queryClient.getQueryData([
          "posts-query",
          variables.postId,
        ]);
        // Optimistic update...
        return { previousData, variables };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(
          ["posts-query", context?.variables.postId],
          context?.previousData,
        );
      },
      onSuccess: (_, variables) => {
        invalidateKeys?.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
      },
    });
  };
}
```

### Step 3: Refactor `use-like-post.ts` → `use-toggle-post.ts`

```typescript
type UseToggleFieldParams = {
  post: PostPopulated;
  field: "likedIds" | "saveIds";
  endpoint: "/like" | "/save";
};

export function useTogglePostField({
  post,
  field,
  endpoint,
}: UseToggleFieldParams) {
  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: async () => {
      const method = post[field].includes(session?.user?.id)
        ? "delete"
        : "post";
      await axios[method](`/api/post/${post.id}${endpoint}`);
    },
    // ... shared optimistic logic
  });

  const hasField = () => post[field].includes(session?.user?.id);
  const toggle = () => mutation.mutate();

  return { [field === "likedIds" ? "hasLiked" : "hasSaved"]: hasField, toggle };
}
```

### Step 4: Update Components

Components using these hooks:

- `components/posts/ReactionButton.tsx` — uses `useLike`
- `components/posts/PostItem.tsx` — uses `useSavePost`
- `components/editor/Editor.tsx` — uses `useCreatePost`

Update imports to use new hooks.

## Files to Modify

| File                                  | Action                                |
| ------------------------------------- | ------------------------------------- |
| `hooks/keys.ts`                       | Create — query key constants          |
| `hooks/use-mutation-utils.ts`         | Create — shared mutation factory      |
| `hooks/use-like-post.ts`              | Refactor → `use-toggle-post.ts`       |
| `hooks/use-save-post.ts`              | Refactor → delete (merged into above) |
| `hooks/use-delete-post.ts`            | Update to use query keys              |
| `hooks/use-create-post.ts`            | Update to use query keys              |
| `components/posts/ReactionButton.tsx` | Update import                         |
| `components/posts/PostItem.tsx`       | Update import                         |
| `components/editor/Editor.tsx`        | Update import                         |

## Validation

- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors
- [ ] Dev server starts
- [ ] Manual test: like/unlike works
- [ ] Manual test: save/unsave works

## Timeline

- **Step 1-2** (keys + utils): 30 min
- **Step 3** (refactor hooks): 45 min
- **Step 4** (update components): 15 min
- **Total**: ~1.5 hours
