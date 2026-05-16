# Better Auth Migration Design

## Overview

Replace Clerk authentication with Better Auth, implementing a custom shadcn modal for login/signup with Google, GitHub, and email/password options.

## Scope

- Migrate from Clerk to Better Auth
- Custom login modal with shadcn UI components
- Social login (Google, GitHub) + email/password authentication
- Fresh database start (clear existing posts, comments, followers)
- Full implementation: server, client, database, UI

---

## Architecture

### System Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐   ┌────────────┐  │
│  │   Shadcn    │    │ better-auth   │   │   Prisma   │  │
│  │   Modal     │───▶│   React       │──▶│   (Mongo)  │  │
│  │   (Dialog)  │    │   Client      │   │            │  │
│  └─────────────┘    └──────────────┘   └────────────┘  │
│                              │                          │
│                              ▼                          │
│                     ┌──────────────┐                   │
│                     │  API Routes  │                   │
│                     │  /api/auth/* │                   │
│                     └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

Better Auth provides API routes for all auth operations (OAuth callbacks, session management, email/password). The React client manages client-side auth state.

---

## Database Schema

### New Models Required

```prisma
model User {
    id            String    @id @default(cuid())
    name          String?
    email         String?   @unique
    emailVerified DateTime?
    image         String?
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt

    sessions      Session[]
    accounts      Account[]
    posts         Post[]
    comments      Comment[]
    followers     Follower[] @relation("Following")
    following     Follower[] @relation("Follower")
    stars         Post[]    @relation("Starred")
    liked         Post[]    @relation("Liked")
}

model Session {
    id        String   @id @default(cuid())
    expiresAt DateTime
    token     String   @unique
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
    id                String  @id @default(cuid())
    userId            String
    type              String
    provider          String
    providerAccountId String
    refresh_token     String? @db.String
    access_token      String? @db.String
    expires_at        Int?
    token_type        String?
    scope             String?
    id_token          String? @db.String
    session_state     String?

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([provider, providerAccountId])
}

model Verification {
    id         String   @id @default(cuid())
    identifier String
    value      String
    expiresAt  DateTime
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt
}
```

### Existing Models Update

Update references in existing models:

```prisma
model Post {
    // ... existing fields
    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
    starIds  String[] // Remove - use relation instead
    likedIds String[] // Remove - use relation instead
}

model Comment {
    // ... existing fields
    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Follower {
    // ... existing fields
    followingId String
    following   User   @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)
    followerId  String
    follower    User   @relation("Follower", fields: [followerId], references: [id], onDelete: Cascade)
}
```

---

## Components

### AuthProvider

Wrap the application with Better Auth's `AuthProvider` from `better-auth/react`.

```tsx
// app/providers.tsx (or similar)
"use client";
import { AuthProvider } from "better-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
```

Update `app/layout.tsx` to use this provider instead of `ClerkProvider`.

### LoginModal Component

A shadcn Dialog containing authentication forms:

- **Tabs** — "Sign In" / "Sign Up" toggle
- **Email/Password Form** — Form with email input, password input, submit button
- **Social Buttons** — Google and GitHub login buttons with icons
- **Error Display** — Show validation or auth errors

Structure:

```
LoginModal
├── Dialog (shadcn)
│   ├── DialogTrigger (Login button)
│   └── DialogContent
│       ├── Tabs (shadcn)
│       │   ├── SignInTab
│       │   │   ├── EmailInput
│       │   │   ├── PasswordInput
│       │   │   └── SubmitButton
│       │   └── SignUpTab
│       │       ├── EmailInput
│       │       ├── PasswordInput
│       │       ├── ConfirmPasswordInput
│       │       └── SubmitButton
│       ├── Divider ("or continue with")
│       ├── SocialButtons
│       │   ├── GoogleButton
│       │   └── GitHubButton
│       └── ErrorMessage
```

### Auth Hooks

Use built-in hooks from `better-auth/react`:

- `useAuth` — Get current session/user state
- `useSignIn` — Email/password sign in
- `useSignUp` — Email/password sign up

### Server-Side Auth

Replace Clerk's `auth()` with Better Auth's `getSession()`:

```typescript
import { getSession } from "better-auth/server";

export async function getAuth() {
  const session = await getSession();
  return session?.user ?? null;
}
```

---

## API Routes

### Better Auth Catch-All Route

Create `app/api/auth/[...all]/route.ts` to handle all Better Auth endpoints:

```typescript
import { authClient } from "better-auth/client";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(authClient);
```

This handles:

- `POST /api/auth/sign-in/email` — Email/password sign in
- `POST /api/auth/sign-up/email` — Email/password sign up
- `GET /api/auth/oauth/google` — Google OAuth start
- `GET /api/auth/oauth/github` — GitHub OAuth start
- `GET /api/auth/get-session` — Get current session
- `POST /api/auth/sign-out` — Sign out

### OAuth Configuration

Configure OAuth providers in Better Auth setup:

```typescript
// better-auth configuration
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
});
```

---

## Environment Variables

Required new/modified variables:

```bash
# Keep existing
DATABASE_URL="mongodb+srv://..."

# Better Auth (already in .env)
BETTER_AUTH_SECRET="4fd0807d935e640ac363d1afdbc72a37"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (already in .env)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Remove Clerk variables
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# CLERK_SECRET_KEY=...
```

---

## Migration Steps

1. **Install better-auth**: `npm install better-auth`
2. **Update Prisma schema**: Add User, Session, Account, Verification models
3. **Run db push**: `npx prisma db push` to sync schema
4. **Clear existing data**: Delete all posts, comments, followers
5. **Create auth API route**: `app/api/auth/[...all]/route.ts`
6. **Create providers**: Replace ClerkProvider with AuthProvider
7. **Build LoginModal**: Custom shadcn modal component
8. **Update components**: Replace all Clerk imports with Better Auth
9. **Update server actions**: Replace `auth()` calls with `getSession()`
10. **Update API routes**: Remove/replace Clerk-specific endpoints
11. **Update Nav**: Login button opens modal, show user when logged in
12. **Test all flows**: Email/password sign up/in, social login, sign out
13. **Remove Clerk**: Remove `@clerk/nextjs` from package.json

---

## Component Changes Reference

### Replace in Client Components

| Clerk                   | Better Auth                 |
| ----------------------- | --------------------------- |
| `useUser`               | `useAuth`                   |
| `SignedIn`, `SignedOut` | Conditional `session` check |
| `SignInButton`          | LoginModal trigger          |
| `useAuth`               | `useAuth`                   |

### Replace in Server Components/Actions

| Clerk                  | Better Auth                           |
| ---------------------- | ------------------------------------- |
| `auth()`               | `getSession()`                        |
| `clerkClient`          | Not needed                            |
| `userId` from `auth()` | `session.user.id` from `getSession()` |

### Files to Update

- `app/layout.tsx` — Provider setup
- `components/nav/Nav.tsx` — Login/user display
- `components/posts/ReactionButton.tsx` — Auth check
- `components/posts/PostItem.tsx` — Auth check
- `components/comments/CommentInput.tsx` — User info
- `components/comments/CommentItem.tsx` — User info
- `components/ProfileBanner.tsx` — Follow button auth
- `components/Banner.tsx` — Sign in button
- `components/WhoToFollow.tsx` — User info
- `actions/*.ts` — All server actions
- `app/api/*/route.ts` — All API routes

---

## Error Handling

- **Invalid credentials**: Display error message in modal
- **OAuth failure**: Redirect to error page with message
- **Session expired**: Redirect to login modal
- **Network errors**: Show toast notification using shadcn `sonner`

---

## Acceptance Criteria

1. User can sign up with email/password
2. User can sign in with email/password
3. User can sign in with Google
4. User can sign in with GitHub
5. User can sign out
6. Login is presented as a modal (not dedicated page)
7. All existing auth-protected features work (posting, commenting, following)
8. Sessions persist across page reloads
9. App builds without errors
10. No Clerk dependencies remain
