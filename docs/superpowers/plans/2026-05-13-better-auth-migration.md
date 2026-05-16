# Better Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Clerk authentication with Better Auth, implement custom shadcn login modal with Google, GitHub, and email/password authentication

**Architecture:** Use Better Auth's React client for auth state, custom shadcn Dialog for login modal, MongoDB with Prisma for session/user storage

**Tech Stack:** Next.js 16, Better Auth, Prisma/MongoDB, shadcn/ui (Dialog, Tabs, Form, Button, Input)

---

## File Structure Overview

```
prisma/schema.prisma      - Add User, Session, Account, Verification models
app/api/auth/[...all]/route.ts - Create: Better Auth catch-all route
app/providers.tsx         - Create: Auth provider wrapper
components/auth/          - Create: LoginModal component
app/layout.tsx            - Modify: Replace ClerkProvider with AuthProvider
.env                      - Modify: Remove Clerk, keep OAuth vars
actions/*.ts              - Modify: Replace auth() calls
app/api/*/route.ts       - Modify: Replace Clerk references
components/nav/Nav.tsx   - Modify: Login button → modal trigger
components/**/*.tsx      - Modify: Replace Clerk hooks
```

---

## Task 1: Install better-auth and Update Prisma Schema

**Files:**

- Modify: `package.json`
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Install better-auth**

Run: `npm install better-auth`

- [ ] **Step 2: Read current Prisma schema**

Read: `prisma/schema.prisma`

- [ ] **Step 3: Update Prisma schema with Better Auth models**

Replace the entire schema with:

```prisma
generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "mongodb"
    url      = env("DATABASE_URL")
}

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

model Post {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    title     String
    body      String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

    comments Comment[]
    tag      String?
    starIds  String[]
    likedIds String[]

    @@index([title, body])
}

model Comment {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    body      String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
    postId String @db.ObjectId
    post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model Follower {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    followingId String
    following   User   @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)
    followerId  String
    follower    User   @relation("Follower", fields: [followerId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 4: Run Prisma db push**

Run: `npx prisma db push`

Expected: Schema synced to MongoDB

- [ ] **Step 5: Commit**

```bash
git add package.json prisma/schema.prisma
git commit -m "feat(auth): add better-auth and update Prisma schema"
```

---

## Task 2: Create Better Auth API Route

**Files:**

- Create: `app/api/auth/[...all]/route.ts`

- [ ] **Step 1: Create auth API route**

Create: `app/api/auth/[...all]/route.ts`

```typescript
import { authClient } from "better-auth/client";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(authClient);
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/[...all]/route.ts
git commit -m "feat(auth): add Better Auth API route"
```

---

## Task 3: Create Auth Provider

**Files:**

- Create: `app/providers.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create providers.tsx**

Create: `app/providers.tsx`

```typescript
"use client";

import { AuthProvider } from "better-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
        </QueryClientProvider>
    );
}
```

- [ ] **Step 2: Update layout.tsx**

Read: `app/layout.tsx`

Replace ClerkProvider with Providers:

```typescript
// Remove these imports:
// import { ClerkProvider } from "@clerk/nextjs";
// import { dark } from "@clerk/themes";

// Add this import:
import { Providers } from "./providers";

// Replace:
// <ClerkProvider appearance={{ baseTheme: dark }}>
//     {children}
// </ClerkProvider>

// With:
// <Providers>{children}</Providers>
```

- [ ] **Step 3: Commit**

```bash
git add app/providers.tsx app/layout.tsx
git commit -m "feat(auth): replace ClerkProvider with AuthProvider"
```

---

## Task 4: Create LoginModal Component

**Files:**

- Create: `components/auth/LoginModal.tsx`

- [ ] **Step 1: Check existing shadcn components**

Run: `ls components/ui/`

Verify these exist: dialog.tsx, tabs.tsx, form.tsx, input.tsx, button.tsx, label.tsx

- [ ] **Step 2: Create LoginModal component**

Create: `components/auth/LoginModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "better-auth/react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/sonner";

interface LoginModalProps {
    children?: React.ReactNode;
}

export function LoginModal({ children }: LoginModalProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const { signIn } = useSignIn();
    const { signUp } = useSignUp();
    const { toast } = useToast();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = await signIn.email({
            email,
            password,
        });

        if (result.error) {
            setError(result.error.message);
        } else {
            setOpen(false);
            setEmail("");
            setPassword("");
            toast("Signed in successfully");
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const result = await signUp.email({
            email,
            password,
            name: email.split("@")[0],
        });

        if (result.error) {
            setError(result.error.message);
        } else {
            setOpen(false);
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            toast("Account created successfully");
        }
    };

    const handleOAuth = async (provider: "google" | "github") => {
        const result = await signIn.oauth({
            provider,
            callbackURL: "/",
        });

        if (result.error) {
            toast(result.error.message, { type: "error" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Login</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Tabs defaultValue="sign-in" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                        <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sign-in">
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signin-email">Email</Label>
                                <Input
                                    id="signin-email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signin-password">Password</Label>
                                <Input
                                    id="signin-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full">
                                Sign In
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="sign-up">
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-confirm">Confirm Password</Label>
                                <Input
                                    id="signup-confirm"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" className="w-full">
                                Sign Up
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleOAuth("google")}
                    >
                        Google
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleOAuth("github")}
                    >
                        GitHub
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/auth/LoginModal.tsx
git commit -m "feat(auth): create LoginModal component with shadcn UI"
```

---

## Task 5: Update Nav Component

**Files:**

- Modify: `components/nav/Nav.tsx`

- [ ] **Step 1: Read current Nav.tsx**

Read: `components/nav/Nav.tsx`

- [ ] **Step 2: Update imports**

Replace Clerk imports:

```typescript
// Remove:
// import { UserButton, SignedIn, SignedOut, auth } from "@clerk/nextjs";

// Add:
import { useAuth } from "better-auth/react";
import { LoginModal } from "@/components/auth/LoginModal";
```

- [ ] **Step 3: Replace auth hook usage**

Find where `useUser()` is used and replace with:

```typescript
const { data: session, isLoading } = useAuth();
```

Replace SignedIn/SignedOut with conditional rendering:

```typescript
{/* Replace: */}
<SignedIn>...</SignedIn>
<SignedOut>...</SignedOut>

{/* With: */}
{session ? (
    // Show user info / menu
) : (
    // Show login button
    <LoginModal>
        <Button variant="ghost">Login</Button>
    </LoginModal>
)}
```

- [ ] **Step 4: Commit**

```bash
git add components/nav/Nav.tsx
git commit -m "feat(auth): update Nav with LoginModal"
```

---

## Task 6: Update Server Actions

**Files:**

- Modify: `actions/post-actions.ts`
- Modify: `actions/comment-actions.ts`
- Modify: `actions/follow-actions.ts`

- [ ] **Step 1: Update post-actions.ts**

Read: `actions/post-actions.ts`

Replace:

```typescript
import { auth } from "@clerk/nextjs/server";
```

With:

```typescript
import { getSession } from "better-auth/server";
```

Replace `const { userId } = await auth();` with:

```typescript
const session = await getSession();
const userId = session?.user?.id;
if (!userId) return { error: "Unauthorized" };
```

- [ ] **Step 2: Update comment-actions.ts**

Read: `actions/comment-actions.ts`

Same changes as post-actions.ts

- [ ] **Step 3: Update follow-actions.ts**

Read: `actions/follow-actions.ts`

Same changes as post-actions.ts

- [ ] **Step 4: Commit**

```bash
git add actions/post-actions.ts actions/comment-actions.ts actions/follow-actions.ts
git commit -m "feat(auth): update server actions to use Better Auth"
```

---

## Task 7: Update API Routes

**Files:**

- Modify: `app/api/user/route.ts`
- Modify: `app/api/user/[userId]/route.ts`
- Modify: `app/api/posts/starred/route.ts`
- Modify: `app/api/posts/following/route.ts`

- [ ] **Step 1: Update app/api/user/route.ts**

Read: `app/api/user/route.ts`

Replace Clerk imports with:

```typescript
import { getSession } from "better-auth/server";
import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/prismadb";
```

Replace user fetching logic to use session:

```typescript
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const users = await prisma.user.findMany({
    take: 5,
    where: {
      id: { not: session.user.id },
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  return NextResponse.json(users);
}
```

- [ ] **Step 2: Update app/api/user/[userId]/route.ts**

Read: `app/api/user/[userId]/route.ts`

Replace Clerk references with session-based auth

- [ ] **Step 3: Update starred and following routes**

Read: `app/api/posts/starred/route.ts` and `app/api/posts/following/route.ts`

Replace `auth()` with `getSession()`

- [ ] **Step 4: Commit**

```bash
git add app/api/user/route.ts app/api/user/\[userId\]/route.ts app/api/posts/starred/route.ts app/api/posts/following/route.ts
git commit -m "feat(auth): update API routes to use Better Auth"
```

---

## Task 8: Update Client Components

**Files:**

- Modify: `components/ProfileBanner.tsx`
- Modify: `components/Banner.tsx`
- Modify: `components/posts/ReactionButton.tsx`
- Modify: `components/posts/PostItem.tsx`
- Modify: `components/comments/CommentInput.tsx`
- Modify: `components/comments/CommentItem.tsx`
- Modify: `components/WhoToFollow.tsx`
- Modify: `components/PostDrawer.tsx`
- Modify: `components/Tabs.tsx`
- Modify: `components/OptionMenu.tsx`

- [ ] **Step 1: Update each component**

For each file:

1. Replace `import { useUser } from "@clerk/nextjs"` with `import { useAuth } from "better-auth/react"`
2. Replace `const { user } = useUser()` with `const { data: session } = useAuth()`
3. Replace `user` references with `session?.user`
4. Replace `SignedIn`/`SignedOut` with conditional `session` checks
5. Replace `SignInButton` with `LoginModal` trigger

- [ ] **Step 2: Commit**

```bash
git add components/ProfileBanner.tsx components/Banner.tsx components/posts/ReactionButton.tsx components/posts/PostItem.tsx components/comments/CommentInput.tsx components/comments/CommentItem.tsx components/WhoToFollow.tsx components/PostDrawer.tsx components/Tabs.tsx components/OptionMenu.tsx
git commit -m "feat(auth): update client components to use Better Auth"
```

---

## Task 9: Remove Clerk and Update .env

**Files:**

- Modify: `.env`
- Modify: `package.json`
- Modify: `AGENTS.md`

- [ ] **Step 1: Update .env**

Read: `.env`

Remove Clerk variables:

```
# Remove these lines:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# CLERK_SECRET_KEY=...
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=...
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=...
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=...
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=...
```

- [ ] **Step 2: Update package.json**

Read: `package.json`

Remove:

```json
"@clerk/nextjs": "^6.36.5",
"@clerk/themes": "^2.4.46",
```

Run: `npm install`

- [ ] **Step 3: Update AGENTS.md**

Read: `AGENTS.md`

Replace Clerk references with Better Auth

- [ ] **Step 4: Commit**

```bash
git add .env package.json AGENTS.md
git commit -m "feat(auth): remove Clerk dependencies"
```

---

## Task 10: Build and Test

**Files:**

- Verify: All changes

- [ ] **Step 1: Run build**

Run: `npm run build`

Expected: Build completes without errors

- [ ] **Step 2: Start dev server**

Run: `npm run dev`

- [ ] **Step 3: Test login flows**

Manual testing:

1. Open http://localhost:3000
2. Click Login button (should open modal)
3. Test email/password sign up
4. Test email/password sign in
5. Test Google sign in
6. Test GitHub sign in
7. Test sign out
8. Verify auth-protected features work (post, comment, follow)

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(auth): complete Better Auth migration"
```

---

## Plan Complete

All tasks written. The plan follows the spec requirements:

- ✅ Replaces Clerk with Better Auth
- ✅ Custom shadcn login modal
- ✅ Google, GitHub, email/password auth
- ✅ Updates all server actions and API routes
- ✅ Updates all client components
- ✅ Removes Clerk dependencies

**Plan saved to:** `docs/superpowers/plans/2026-05-13-better-auth-migration.md`

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
