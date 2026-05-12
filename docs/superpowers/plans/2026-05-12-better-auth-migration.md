# Better Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Clerk authentication with Better Auth, using custom UI components for full control over auth flow (email/password + OAuth, custom sign-up fields, role-based access ready)

**Architecture:** Use Better Auth core with custom React components for sign-in/sign-up UI. Replace all Clerk hooks (`useUser`, `useAuth`, `SignedIn`, `SignedOut`) with Better Auth equivalents. Update middleware and API routes to use Better Auth session validation.

**Tech Stack:** Next.js 16 (App Router), Better Auth, MongoDB via Prisma, React hooks

---

## Dependencies & Setup

### Task 1: Install Better Auth packages

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Add Better Auth dependencies**

```bash
npm install better-auth @better-auth/react @better-auth/nextjs
npm install -D @better-auth/cli
```

- [ ] **Step 2: Add to package.json scripts**

Add to `package.json` scripts section:

```json
"auth:generate": "npx @better-auth/cli generate",
"auth:migrate": "npx @better-auth/cli migrate"
```

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add Better Auth dependencies"
```

---

### Task 2: Configure environment variables

**Files:**

- Modify: `.env.example`

- [ ] **Step 1: Add Better Auth env vars to .env.example**

Add to `.env.example`:

```env
# Better Auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Social OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: add Better Auth environment variables"
```

---

## Server Configuration

### Task 3: Create Better Auth server config

**Files:**

- Create: `lib/auth.ts`

- [ ] **Step 1: Create auth.ts with Better Auth configuration**

Create `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prismadb";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  advanced: {
    cookiePrefix: "mypost",
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: add Better Auth server configuration"
```

---

### Task 4: Create Better Auth API route handler

**Files:**

- Create: `app/api/auth/[...all]/route.ts`

- [ ] **Step 1: Create auth route handler**

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/\[...all\]/route.ts
git commit -m "feat: add Better Auth API route handler"
```

---

## Client Configuration

### Task 5: Create Better Auth client config

**Files:**

- Create: `lib/auth-client.ts`

- [ ] **Step 1: Create auth-client.ts with React client**

Create `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  basePath: "/api/auth",
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth-client.ts
git commit -m "feat: add Better Auth client configuration"
```

---

## Auth UI Components

### Task 6: Create SignInForm component

**Files:**

- Create: `components/auth/SignInForm.tsx`

- [ ] **Step 1: Create SignInForm component**

Create `components/auth/SignInForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Props = {
  onToggleMode: () => void;
};

export default function SignInForm({ onToggleMode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await signIn.email({
      email,
      password,
    });

    if (authError) {
      setError(authError.message || "Invalid credentials");
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    await signIn.social({
      provider,
      callbackURL: "/",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <button onClick={onToggleMode} className="text-primary hover:underline">
            Sign up
          </button>
        </p>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleOAuthSignIn("github")}
            className="flex-1 py-2 px-4 border rounded-md hover:bg-accent"
          >
            GitHub
          </button>
          <button
            onClick={() => handleOAuthSignIn("google")}
            className="flex-1 py-2 px-4 border rounded-md hover:bg-accent"
          >
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/SignInForm.tsx
git commit -m "feat: create SignInForm component"
```

---

### Task 7: Create SignUpForm component

**Files:**

- Create: `components/auth/SignUpForm.tsx`

- [ ] **Step 1: Create SignUpForm component**

Create `components/auth/SignUpForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Props = {
  onToggleMode: () => void;
};

export default function SignUpForm({ onToggleMode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await signUp.email({
      email,
      password,
      name,
    });

    if (authError) {
      setError(authError.message || "Sign up failed");
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <button onClick={onToggleMode} className="text-primary hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/SignUpForm.tsx
git commit -m "feat: create SignUpForm component"
```

---

### Task 8: Create AuthForm toggle component

**Files:**

- Create: `components/auth/AuthForm.tsx`

- [ ] **Step 1: Create AuthForm component**

Create `components/auth/AuthForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {mode === "sign-in" ? (
          <SignInForm onToggleMode={() => setMode("sign-up")} />
        ) : (
          <SignUpForm onToggleMode={() => setMode("sign-in")} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/AuthForm.tsx
git commit -m "feat: create AuthForm component"
```

---

### Task 9: Create UserMenu component

**Files:**

- Create: `components/auth/UserMenu.tsx`

- [ ] **Step 1: Create UserMenu component**

Create `components/auth/UserMenu.tsx`:

```typescript
"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
    router.push("/");
  };

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium hidden sm:block">
        {session.user.name ?? session.user.email}
      </span>
      <button onClick={handleSignOut}>
        <Avatar className="w-8 h-8">
          <AvatarImage src={session.user.image ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/UserMenu.tsx
git commit -m "feat: create UserMenu component"
```

---

### Task 10: Create SessionGuard component

**Files:**

- Create: `components/auth/SessionGuard.tsx`

- [ ] **Step 1: Create SessionGuard component**

Create `components/auth/SessionGuard.tsx`:

```typescript
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function SignedIn({ children }: Props) {
  const { data: session, isPending } = useSession();

  if (isPending) return null;
  if (!session) return null;

  return <>{children}</>;
}

export function SignedOut({ children }: Props) {
  const { data: session, isPending } = useSession();

  if (isPending) return null;
  if (session) return null;

  return <>{children}</>;
}

export function AuthGuard({ children, fallback }: Props) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) return null;
  if (!session) return fallback ?? null;

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/SessionGuard.tsx
git commit -m "feat: create SessionGuard component"
```

---

## Update Existing Components

### Task 11: Update Nav component

**Files:**

- Modify: `components/Nav.tsx`

- [ ] **Step 1: Replace Clerk imports with Better Auth**

Replace:

```typescript
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
```

With:

```typescript
import UserMenu from "./auth/UserMenu";
import { SignedIn, SignedOut } from "./auth/SessionGuard";
import Link from "next/link";
```

- [ ] **Step 2: Update Nav component body**

Replace the component body to use:

```typescript
const Nav = () => {
  return (
    <div className="h-16.25 border-b-[#444C56] border-b flex justify-between items-center px-10 xl:px-20">
      <Link href="/" className="text-lg text-white cursor-pointer flex items-center gap-2">
        <Rocket size={24} />
        <div className="text-lg font-semibold">Mypost but Github</div>
      </Link>

      <div className="flex items-center text-white gap-3">
        <SignedIn>
          <UserMenu />
        </SignedIn>
        <SignedOut>
          <Link
            href="/sign-in"
            className="w-32.5 h-8 rounded-sm flex items-center justify-center"
          >
            Join Us ✌️🎉
          </Link>
        </SignedOut>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add components/Nav.tsx
git commit -m "refactor: replace Clerk with Better Auth in Nav"
```

---

### Task 12: Update Banner component

**Files:**

- Modify: `components/Banner.tsx`

- [ ] **Step 1: Replace Clerk imports**

Replace:

```typescript
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
```

With:

```typescript
import { SignedIn, SignedOut } from "./auth/SessionGuard";
import Link from "next/link";
```

- [ ] **Step 2: Update Banner component**

Replace the sign-in button:

```typescript
<SignedOut>
  <SignInButton mode="modal">
    <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
      Sign In
    </button>
  </SignInButton>
</SignedOut>
```

With:

```typescript
<SignedOut>
  <Link href="/sign-in" className="bg-blue-600 text-white px-4 py-2 rounded-md">
    Sign In
  </Link>
</SignedOut>
```

- [ ] **Step 3: Commit**

```bash
git add components/Banner.tsx
git commit -m "refactor: replace Clerk with Better Auth in Banner"
```

---

### Task 13: Update PostDrawer component

**Files:**

- Modify: `components/PostDrawer.tsx`

- [ ] **Step 1: Replace useAuth import**

Replace:

```typescript
import { useAuth } from "@clerk/nextjs";
```

With:

```typescript
import { useSession } from "@/lib/auth-client";
```

- [ ] **Step 2: Update component usage**

Replace:

```typescript
const { userId, isLoaded } = useAuth();
```

With:

```typescript
const { data: session, isPending: isLoaded } = useSession();
```

Replace `userId` with `session?.user?.id` throughout the component.

- [ ] **Step 3: Commit**

```bash
git add components/PostDrawer.tsx
git commit -m "refactor: replace Clerk with Better Auth in PostDrawer"
```

---

### Task 14: Update OptionMenu component

**Files:**

- Modify: `components/OptionMenu.tsx`

- [ ] **Step 1: Replace useAuth import**

Replace:

```typescript
import { useAuth } from "@clerk/nextjs";
```

With:

```typescript
import { useSession } from "@/lib/auth-client";
```

- [ ] **Step 2: Update component**

Replace `useAuth()` with `useSession()` and use `session?.user?.id`.

- [ ] **Step 3: Commit**

```bash
git add components/OptionMenu.tsx
git commit -m "refactor: replace Clerk with Better Auth in OptionMenu"
```

---

### Task 15: Update ReactionButton component

**Files:**

- Modify: `components/posts/ReactionButton.tsx`

- [ ] **Step 1: Replace Clerk imports**

Replace `SignedIn, SignedOut, SignInButton` from Clerk with custom button using Link to sign-in.

- [ ] **Step 2: Commit**

```bash
git add components/posts/ReactionButton.tsx
git commit -m "refactor: replace Clerk with Better Auth in ReactionButton"
```

---

### Task 16: Update Tabs component

**Files:**

- Modify: `components/Tabs.tsx`

- [ ] **Step 1: Replace useAuth import**

Replace:

```typescript
import { useAuth } from "@clerk/nextjs";
```

With:

```typescript
import { useSession } from "@/lib/auth-client";
```

- [ ] **Step 2: Update component**

Replace `useAuth()` with `useSession()` and use `session?.user?.id`.

- [ ] **Step 3: Commit**

```bash
git add components/Tabs.tsx
git commit -m "refactor: replace Clerk with Better Auth in Tabs"
```

---

### Task 17: Update CommentInput component

**Files:**

- Modify: `components/comments/CommentInput.tsx`

- [ ] **Step 1: Replace useUser import**

Replace:

```typescript
import { useUser } from "@clerk/nextjs";
```

With:

```typescript
import { useSession } from "@/lib/auth-client";
```

- [ ] **Step 2: Update component**

Replace:

```typescript
const { user, isLoaded } = useUser();
if (!isLoaded) return null;
```

With:

```typescript
const { data: session, isPending: isLoaded } = useSession();
if (isLoaded) return null;
```

Replace `user` with `session?.user`.

- [ ] **Step 3: Commit**

```bash
git add components/comments/CommentInput.tsx
git commit -m "refactor: replace Clerk with Better Auth in CommentInput"
```

---

## Update Server Actions

### Task 18: Update serverActions.ts

**Files:**

- Modify: `actions/serverActions.ts`

- [ ] **Step 1: Replace auth import**

Replace:

```typescript
import { auth } from "@clerk/nextjs/server";
```

With:

```typescript
import { auth } from "@/lib/auth";
```

- [ ] **Step 2: Update all auth() calls**

In all server actions, replace:

```typescript
const { userId } = await auth();
```

With the Better Auth session pattern:

```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session) return new Response("Unauthorized", { status: 401 });
const userId = session.user.id;
```

- [ ] **Step 3: Commit**

```bash
git add actions/serverActions.ts
git commit -m "refactor: replace Clerk with Better Auth in serverActions"
```

---

## Update API Routes

### Task 19: Update all API routes to use Better Auth

**Files:**

- Modify: `app/api/post/[postId]/comment/route.ts`
- Modify: `app/api/post/[postId]/like/route.ts`
- Modify: `app/api/post/[postId]/save/route.ts`
- Modify: `app/api/post/[postId]/route.ts`
- Modify: `app/api/posts/[userId]/route.ts`
- Modify: `app/api/posts/[userId]/saves/route.ts`
- Modify: `app/api/user/[userId]/route.ts`
- Modify: `app/api/user/route.ts`
- Modify: `app/api/post/route.ts`
- Modify: `app/api/posts/route.ts`

- [ ] **Step 1: Replace auth import in each file**

Replace:

```typescript
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
```

With:

```typescript
import { auth } from "@/lib/auth";
```

For `clerkClient` usage to get user list, create a helper in `lib/auth.ts`:

```typescript
export async function getUserList() {
  const session = await auth.api.getSession({ headers: await headers() });
  // Better Auth doesn't have built-in user list - you may need to query via Prisma
  // Or use admin plugin
}
```

- [ ] **Step 2: Update session handling in each route**

Replace:

```typescript
const { userId } = await auth();
```

With:

```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session) return new NextResponse("Unauthorized", { status: 401 });
const userId = session.user.id;
```

- [ ] **Step 3: Commit all changes**

```bash
git add app/api/
git commit -m "refactor: replace Clerk with Better Auth in API routes"
```

---

## Update Middleware

### Task 20: Update middleware

**Files:**

- Modify: `proxy.ts` (rename to `middleware.ts`)

- [ ] **Step 1: Replace Clerk middleware**

Replace `proxy.ts` with `middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAuthPage =
    req.nextUrl.pathname.startsWith("/sign-in") ||
    req.nextUrl.pathname.startsWith("/sign-up");

  if (!isLoggedIn && !isOnAuthPage) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isLoggedIn && isOnAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts middleware.ts
git commit -m "refactor: replace Clerk middleware with Better Auth"
```

---

## Update Layout

### Task 21: Update app layout

**Files:**

- Modify: `app/layout.tsx`

- [ ] **Step 1: Remove ClerkProvider**

Remove:

```typescript
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

<ClerkProvider appearance={{ baseTheme: dark }}>
```

- [ ] **Step 2: Remove closing tag**

Remove `</ClerkProvider>` wrapper.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "refactor: remove ClerkProvider from layout"
```

---

## Generate Auth Schema

### Task 22: Generate Better Auth schema

**Files:**

- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Generate Better Auth schema**

```bash
npx @better-auth/cli generate --output prisma/auth-schema.prisma
```

- [ ] **Step 2: Merge with existing schema**

Add the generated models to `prisma/schema.prisma`:

```prisma
// Add these to your existing schema
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Add your app-specific fields below
  // posts        Post[]
  // comments     Comment[]
}

model Session {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  accountId         String
  provider          String
  accessToken       String?
  refreshToken      String?
  idToken           String?
  accessTokenExpiresAt DateTime?
  refreshTokenExpiresAt DateTime?
  scope             String?
  password          String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, accountId])
}

model Verification {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
}
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "chore: add Better Auth models to Prisma schema"
```

---

### Task 23: Run Prisma migrate

**Files:**

- Modify: Database

- [ ] **Step 1: Run Prisma migrate**

```bash
npx prisma migrate dev --name add_better_auth
```

- [ ] **Step 2: Commit**

```bash
git add prisma/
git commit -m "chore: migrate Better Auth models to database"
```

---

## Create Auth Pages

### Task 24: Create sign-in page

**Files:**

- Create: `app/sign-in/page.tsx`

- [ ] **Step 1: Create sign-in page**

Create `app/sign-in/page.tsx`:

```typescript
import AuthForm from "@/components/auth/AuthForm";

export default function SignInPage() {
  return <AuthForm />;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/sign-in/page.tsx
git commit -m "feat: create sign-in page"
```

---

### Task 25: Create sign-up page

**Files:**

- Create: `app/sign-up/page.tsx`

- [ ] **Step 1: Create sign-up page**

Create `app/sign-up/page.tsx`:

```typescript
import AuthForm from "@/components/auth/AuthForm";

export default function SignUpPage() {
  return <AuthForm />;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/sign-up/page.tsx
git commit -m "feat: create sign-up page"
```

---

## Final Steps

### Task 26: Verify build

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Fix any errors**

---

### Task 27: Test auth flows

**Manual testing checklist:**

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with GitHub
- [ ] Sign in with Google
- [ ] Sign out
- [ ] Create post (uses correct userId)
- [ ] Like post (uses correct userId)
- [ ] Save post (uses correct userId)
- [ ] Protected routes redirect to sign-in

---

### Task 28: Remove Clerk dependency

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Remove Clerk**

```bash
npm uninstall @clerk/nextjs @clerk/themes
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove Clerk dependencies"
```

---

## Plan Complete

**Verification:**

- [ ] All 28 tasks complete
- [ ] Build passes
- [ ] Auth flows tested

**Files created:**

- `lib/auth.ts` - Server auth config
- `lib/auth-client.ts` - Client auth config
- `app/api/auth/[...all]/route.ts` - Auth API handler
- `components/auth/SignInForm.tsx` - Sign in form
- `components/auth/SignUpForm.tsx` - Sign up form
- `components/auth/AuthForm.tsx` - Auth toggle
- `components/auth/UserMenu.tsx` - User dropdown
- `components/auth/SessionGuard.tsx` - Session guards
- `app/sign-in/page.tsx` - Sign in page
- `app/sign-up/page.tsx` - Sign up page
- `middleware.ts` - Auth middleware

**Files modified:**

- `package.json` - Better Auth deps
- `.env.example` - Auth env vars
- `prisma/schema.prisma` - Auth models
- `app/layout.tsx` - Removed ClerkProvider
- `components/Nav.tsx` - Better Auth
- `components/Banner.tsx` - Better Auth
- `components/PostDrawer.tsx` - Better Auth
- `components/OptionMenu.tsx` - Better Auth
- `components/posts/ReactionButton.tsx` - Better Auth
- `components/Tabs.tsx` - Better Auth
- `components/comments/CommentInput.tsx` - Better Auth
- `actions/serverActions.ts` - Better Auth
- All API routes - Better Auth
