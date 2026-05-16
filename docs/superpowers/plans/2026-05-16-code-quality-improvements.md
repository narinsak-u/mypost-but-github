# Code Quality Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical security vulnerabilities, improve code quality, and optimize performance across the codebase based on multi-dimensional code review.

**Architecture:** Fix security issues first (XSS), then consolidate duplicate code, add proper typing, and optimize performance.

**Tech Stack:** Next.js 16, TypeScript, TanStack Query, Prisma, MongoDB

---

## Task 1: Fix XSS Vulnerability in PostItem

**Files:**
- Modify: `components/posts/PostItem.tsx:93-98`

- [ ] **Step 1: Install DOMPurify for HTML sanitization**

Run: `npm install isomorphic-dompurify`
Expected: Package installed successfully

- [ ] **Step 2: Import DOMPurify and sanitize user content**

Add import at top of file:
```typescript
import DOMPurify from "isomorphic-dompurify";
```

Replace line 97 (dangerouslySetInnerHTML):
```typescript
const sanitizedBody = useMemo(
  () => (postBody ? DOMPurify.sanitize(postBody) : ""),
  [postBody]
);

// Replace the div with sanitized content
<div
  className={cn(
    isSuggestion && "text-xs text-[#ADBAC7] line-clamp-2 mt-2",
  )}
  dangerouslySetInnerHTML={{ __html: sanitizedBody }}
/>
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/posts/PostItem.tsx package.json
git commit -m "fix: add XSS protection with DOMPurify in PostItem"
```

---

## Task 2: Fix @ts-ignore in Editor Component

**Files:**
- Modify: `components/editor/Editor.tsx:6-7`

- [ ] **Step 1: Remove @ts-ignore and add proper typing**

```typescript
// Replace lines 3-7 with proper import
import { filterSuggestionItems } from "@blocknote/core/extensions";
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/editor/Editor.tsx
git commit -m "fix: remove @ts-ignore in Editor component"
```

---

## Task 3: Fix Duplicate Code in Posts API Route

**Files:**
- Modify: `app/api/posts/route.ts`

- [ ] **Step 1: Consolidate duplicate findMany calls**

Replace the entire GET function (lines 6-64):
```typescript
export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  try {
    const limitParam = url.searchParams.get("limit");
    const pageParam = url.searchParams.get("page");

    const limit = limitParam ? parseInt(limitParam) : 10;
    const page = pageParam ? parseInt(pageParam) : 1;

    // Always use pagination - even without params, use defaults
    const posts = await prisma.post.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        comments: {
          include: {
            post: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/");

    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new NextResponse("Could not fetch posts", { status: 500 });
  }
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/api/posts/route.ts
git commit -m "refactor: consolidate duplicate findMany in posts API"
```

---

## Task 4: Add Environment Validation

**Files:**
- Create: `lib/env.ts`
- Modify: `lib/auth.ts`

- [ ] **Step 1: Create env validation module**

Create `lib/env.ts`:
```typescript
const requiredEnvVars = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
] as const;

export function validateEnv() {
  const missing: string[] = [];
  
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

// Call validation at module load
validateEnv();
```

- [ ] **Step 2: Import env validation in auth.ts**

Add at top of lib/auth.ts (after imports):
```typescript
import "@/lib/env";
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/env.ts lib/auth.ts
git commit -m "feat: add runtime environment validation"
```

---

## Task 5: Create Constants File for Magic Numbers

**Files:**
- Create: `lib/constants.ts`

- [ ] **Step 1: Create constants file**

Create `lib/constants.ts`:
```typescript
// Query timings (in milliseconds)
export const QUERY_TIMES = {
  CONVERSATIONS_REFETCH: 5000,
  MESSAGES_REFETCH: 3000,
  POSTS_STALE_TIME: 1000 * 60 * 5,
  POSTS_GC_TIME: 1000 * 60 * 30,
} as const;

// UI constants
export const UI = {
  MAX_SEARCH_RESULTS: 8,
  SEARCH_DEBOUNCE_MS: 250,
  AVATAR_FALLBACK: "https://github.com/shadcn.png",
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  DEFAULT_PAGE: 1,
} as const;
```

- [ ] **Step 2: Update hooks to use constants**

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: add constants file for magic numbers"
```

---

## Task 6: Fix Type Safety Issues in Nav Component

**Files:**
- Modify: `components/nav/Nav.tsx:59-80`

- [ ] **Step 1: Add proper User type and remove any**

Add interface near top of file:
```typescript
interface UserListItem {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/nav/Nav.tsx
git commit -m "fix: add proper typing in Nav component"
```

---

## Task 7: Fix Accessibility in ChatDialog

**Files:**
- Modify: `components/chat/ChatDialog.tsx:28-41`

- [ ] **Step 1: Replace role="button" with native button element**

```typescript
// Replace the div with role="button" to use native button
<button
  type="button"
  className="h-12 px-4 flex items-center justify-between border-b border-[#30363D] bg-[#262D34] cursor-pointer w-full"
  onClick={() => toggleCollapse()}
/>
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/chat/ChatDialog.tsx
git commit -m "fix: improve accessibility in ChatDialog with native button"
```

---

## Task 8: Remove Dead Code

**Files:**
- Modify: `components/WhoToFollow.tsx`

- [ ] **Step 1: Remove commented-out code**

- [ ] **Step 2: Commit**

```bash
git add components/WhoToFollow.tsx
git commit -m "chore: remove dead code in WhoToFollow"
```

---

## Task 9: Improve Error Handling in Server Actions

**Files:**
- Modify: `actions/post-actions.ts:144,190`

- [ ] **Step 1: Replace console.log with proper error logging**

Replace:
```typescript
console.log(error);
```
with:
```typescript
console.error("toggleLike error:", error);
```

- [ ] **Step 2: Commit**

```bash
git add actions/post-actions.ts
git commit -m "fix: improve error logging in post-actions"
```

---

## Task 10: Verify Build

**Files:**
- All

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Build completes successfully

- [ ] **Step 2: Final verification**

Run: `npx tsc --noEmit`
Expected: No errors
