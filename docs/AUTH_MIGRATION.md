# Auth Migration: Clerk → Better Auth

## Overview

This project migrated from Clerk to Better Auth for authentication.

## Changes Made

1. All server actions now use `getCurrentSession()` from `@/lib/auth-helpers`
2. Client components use `useSession()` from `@/lib/auth-client`
3. Removed all `@clerk/nextjs` imports and dependencies
4. User data structure changed:
   - `firstName`, `lastName` → `name`
   - `imageUrl` → `image`

## Testing

Run: `npm test`

## Files Modified

- `actions/post-actions.ts`
- `actions/comment-actions.ts`
- `actions/follow-actions.ts`
- `components/posts/ReactionButton.tsx`
- `components/comments/CommentItem.tsx`
- `components/contents/LeftContent.tsx`
- `hooks/use-get-saved-count.ts`
- `hooks/use-post-count.ts`

## New Files

- `lib/auth-helpers.ts` - Shared auth utilities
- `app/api/link/route.ts` - SSRF protection added
