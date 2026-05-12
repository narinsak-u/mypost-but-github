# Better Auth Integration Design

**Date:** 2026-05-12  
**Status:** Approved  
**Author:** AI Review  
**Prerequisites:** None

## Overview

Replace Clerk authentication with Better Auth, using custom UI components for full control over the auth flow.

## Goals

1. Support email/password + OAuth (GitHub, Google)
2. Custom sign-up fields (username, email, password)
3. Full control over auth UI (custom components)
4. Role-based access ready (future-proof)
5. Fresh start — clear existing users

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Custom Auth  │  │   Nav Bar    │  │ Protected    │ │
│  │ Components   │  │   (UserBtn)  │  │   Routes     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │          │
│         └────────────────┬┴─────────────────┘          │
│                          ▼                              │
│              ┌─────────────────────┐                  │
│              │  Better Auth Client  │                  │
│              │   (React Hooks)      │                  │
│              └──────────┬───────────┘                  │
└─────────────────────────┼─────────────────────────────┘
                          ▼
┌─────────────────────────┼─────────────────────────────┐
│                    Server                               │
│         ┌───────────────┴───────────────┐              │
│         ▼                               ▼              │
│  ┌──────────────┐              ┌──────────────┐        │
│  │ Better Auth │              │  Your API    │        │
│  │  API Routes │              │   Routes     │        │
│  └──────────────┘              └──────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## No Schema Changes Required

Store `userId` from Better Auth session in existing fields:
- `Post.userId` — already String, works as-is
- `Comment.userId` — already String, works as-is

No User model needed initially. When roles are needed, add a simple `role` field to relevant models.

## Components to Build

| Component | Purpose | Location |
|-----------|---------|----------|
| `AuthForm` | Sign in / Sign up toggle | `components/auth/AuthForm.tsx` |
| `SignInForm` | Email + password + OAuth | `components/auth/SignInForm.tsx` |
| `SignUpForm` | Email, password, username, custom fields | `components/auth/SignUpForm.tsx` |
| `OAuthButtons` | GitHub, Google login | `components/auth/OAuthButtons.tsx` |
| `UserMenu` | Avatar dropdown, sign out | `components/auth/UserMenu.tsx` |
| `ProtectedRoute` | Route wrapper | `components/auth/ProtectedRoute.tsx` |

## Replacement Map

| Clerk Component/Hook | Replace With |
|---------------------|--------------|
| `ClerkProvider` | `AuthProvider` (Better Auth) |
| `useUser()` | `useSession()` |
| `useAuth()` | `useSession()` |
| `SignedIn` | `SessionGuard` component |
| `SignedOut` | `GuestGuard` component |
| `SignInButton` | Custom `<button>` + router |
| `UserButton` | `UserMenu` component |
| `clerkClient` | `betterAuthClient` |
| `auth()` (server) | `getSession()` from better-auth/server |
| `clerkMiddleware()` | Custom middleware with `getSession()` |

## API Routes to Create

| Route | Handler | Purpose |
|-------|---------|---------|
| `GET /api/auth/session` | Better Auth | Get current session |
| `POST /api/auth/sign-in/email` | Better Auth | Email sign-in |
| `POST /api/auth/sign-up/email` | Better Auth | Email sign-up |
| `POST /api/auth/sign-out` | Better Auth | Sign out |
| `GET /api/auth/oauth/*` | Better Auth | OAuth callbacks |

## Implementation Order

1. Install `@better-auth/react`, `@better-auth/nextjs`, adapters
2. Create `/app/api/auth/[...all]/route.ts` for Better Auth
3. Replace `ClerkProvider` in `app/layout.tsx`
4. Build custom auth components
5. Update `components/Nav.tsx` with UserMenu
6. Update `components/Banner.tsx`
7. Update `components/PostDrawer.tsx`
8. Update `components/OptionMenu.tsx`
9. Update `actions/serverActions.ts`
10. Update all `/app/api/*` routes
11. Create new `middleware.ts` with Better Auth
12. Test all auth flows

## Custom Sign-Up Fields

SignUpForm collects:
- Email (required, validated)
- Password (required, min 8 chars)
- Confirm password (must match)
- Username (required, unique, 3-20 chars, alphanumeric + underscore)

Validation errors displayed inline, before submission.

## Security Considerations

- Passwords hashed by Better Auth (bcrypt)
- Session tokens in HTTP-only cookies
- CSRF protection via Better Auth
- OAuth only from configured providers

## Testing Checklist

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with GitHub OAuth
- [ ] Sign in with Google OAuth
- [ ] Sign out clears session
- [ ] Protected routes redirect guests
- [ ] Nav shows correct state (signed in vs out)
- [ ] Create post uses correct userId
- [ ] Like/save post uses correct userId
- [ ] API routes reject unauthenticated requests