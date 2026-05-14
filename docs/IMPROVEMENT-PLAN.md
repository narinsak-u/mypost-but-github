# Improvement Plan - Better Auth Migration

This document outlines the improvements and fixes identified during the code review of the Better Auth migration.

## 1. Database & Schema Fixes (Prisma)

- [ ] **Fix `emailVerified` type:**
  - **File:** `prisma/schema.prisma`
  - **Issue:** Currently `Boolean?`, but Better Auth expects `DateTime?`.
  - **Action:** Change `emailVerified Boolean?` to `emailVerified DateTime?`.
- [ ] **Cleanup `Account` model:**
  - **File:** `prisma/schema.prisma`
  - **Issue:** Redundant expiration fields (`expiresAt` Int? and `accessTokenExpiresAt` DateTime?).
  - **Action:** Verify which field Better Auth uses for the Prisma adapter and consolidate.

## 2. Server Action Reliability

- [ ] **Implement Atomic Updates for Likes/Stars:**
  - **File:** `actions/post-actions.ts`
  - **Issue:** Current read-modify-write pattern is prone to race conditions.
  - **Action:** Use Prisma's atomic operations (e.g., `{ push: userId }` or `{ set: ... }`) to update `likedIds` and `starIds`.
  - **Note:** Ensure compatibility with MongoDB scalar lists.

## 3. UI/UX & Accessibility (a11y)

- [ ] **Add Accessible Title to Login Modal:**
  - **File:** `components/auth/LoginModal.tsx`
  - **Issue:** `DialogTitle` is empty.
  - **Action:** Provide a descriptive title like "Sign in to Mypost".
- [ ] **Restore Modal Exit Accessibility:**
  - **File:** `components/auth/LoginModal.tsx`
  - **Issue:** `[&>button]:hidden` hides the default close button.
  - **Action:** Ensure keyboard users can easily exit the modal. Consider restoring the close button or adding a clear "Cancel" action.
- [ ] **Add Loading State for OAuth:**
  - **File:** `components/auth/LoginModal.tsx`
  - **Issue:** `handleOAuth` doesn't toggle the loading state.
  - **Action:** Wrap OAuth call in `setLoading(true)` / `setLoading(false)`.

## 4. Verification & Security

- [ ] **Audit Custom API Routes for CSRF:**
  - **Files:** `app/api/user/route.ts`, `app/api/user/[userId]/route.ts`
  - **Action:** Ensure these routes are protected by Better Auth middleware or that the session check is sufficient against CSRF if called from client-side `fetch`.
- [ ] **Run Type Check:**
  - **Action:** Run `npx tsc --noEmit` to ensure no regressions after schema changes.
