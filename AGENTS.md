# Agent Guidelines for mypost-but-github

A mini social media app inspired by GitHub + Pantip built with Next.js App Router, Clerk auth, Prisma/MongoDB, and Tailwind CSS.

---

## 1. Build / Lint / Test Commands

All commands run from the project root:

```bash
# Development
npm run dev                    # Start dev server at http://localhost:3000

# Production
npm run build                  # Production build
npm run start                  # Start production server

# Linting
npm run lint                   # Run Next.js ESLint

# Database
npx prisma db push             # Sync Prisma schema to database
npx prisma studio              # Open Prisma database GUI
npx prisma generate            # Generate Prisma client (runs on postinstall)
```

**There is currently no test suite** - do not attempt to run tests.

---

## 2. Code Style Guidelines

### 2.1 Project Structure

```
mypost-but-github/
├── actions/           # Server Actions ("use server")
├── app/               # Next.js App Router pages
├── components/        # React components
│   ├── ui/            # shadcn/ui base components
│   ├── nav/           # Navigation components
│   ├── posts/         # Post-related components
│   └── comments/      # Comment components
├── hooks/             # Custom React hooks
├── lib/               # Utilities (prismadb, utils)
├── providers/         # React context providers
├── prisma/            # Database schema
├── public/            # Static assets
├── store/             # Zustand stores
├── types/             # TypeScript types and Zod validators
├── site/              # Site metadata
└── data/              # Data utilities
```

### 2.2 Imports

- Use path aliases: `@/*` (mapped to root)
- Order imports: external → internal → relative
- Example:
  ```typescript
  import { useState } from "react";
  import { z } from "zod";
  import { db as prisma } from "@/lib/prismadb";
  import { PostValidator } from "@/types";
  import { createPost } from "@/actions/post-actions";
  import { cn } from "@/lib/utils";
  ```

### 2.3 TypeScript

- Use strict mode (`noUncheckedIndexedAccess: true` enabled)
- Define types in `types/index.ts` using Zod validators
- Use interfaces for object shapes, types for unions/primitives
- Example pattern:
  ```typescript
  import { z } from "zod";

  export const PostValidator = z.object({
    title: z.string().min(1).max(256),
    body: z.string().min(1),
    tag: z.string().optional(),
  });

  export type Post = z.infer<typeof PostValidator>;
  ```

### 2.4 Naming Conventions

- **Files**: kebab-case (`post-actions.ts`, `Nav.tsx`)
- **Components**: PascalCase (`PostCard.tsx`, `Nav.tsx`)
- **Functions/Variables**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Server Actions**: camelCase with descriptive names (`createPost`, `toggleLike`)

### 2.5 Component Patterns

- Use functional components with TypeScript
- Props interface named `{ComponentName}Props`
- Use `cn()` from `@/lib/utils` for className merging
- Extract reusable logic into custom hooks in `hooks/`
- Server components by default, add `"use client"` only when needed

Example:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn("px-4 py-2", variant === "outline" && "border", className)}
      {...props}
    />
  );
}
```

### 2.6 Server Actions

- Always mark with `"use server"` at top of file
- Handle errors with try/catch
- Return typed results (union types for success/error)
- Use Zod for input validation
- Call `revalidatePath()` after mutations

Example:
```typescript
export type ToggleLikeResult = { hasLiked: boolean } | { error: string };

export const toggleLike = async (postId: string): Promise<ToggleLikeResult> => {
  const { userId } = await auth();
  
  try {
    if (!userId) return { error: "Unauthorized" };
    // ... mutation logic
    return { hasLiked: true };
  } catch (error) {
    console.log(error);
    return { error: "Internal server error" };
  }
};
```

### 2.7 Error Handling

- Use try/catch in server actions
- Return error objects rather than throwing for expected failures
- Throw for unexpected errors
- Log errors with `console.log(error)` in server actions
- Use Zod validation errors: `if (error instanceof z.ZodError) throw new Error(error.message)`

### 2.8 State Management

- **Server state**: TanStack Query for data fetching/caching
- **Client state**: Zustand stores in `store/`
- **Form state**: React Hook Form with Zod resolver
- Use `revalidatePath()` after server mutations

### 2.9 CSS / Styling

- Use Tailwind CSS v4 (no separate config file, uses CSS variables)
- Use `cn()` utility for conditional classes
- Use shadcn/ui components from `components/ui/`
- Avoid custom CSS; use Tailwind utilities

### 2.10 Authentication

- Use Clerk (`@clerk/nextjs`)
- Server components: `import { auth } from "@clerk/nextjs/server"`
- Client components: `import { useUser } from "@clerk/nextjs"`
- Protect routes by checking `userId` from `auth()`

---

## 3. Key Dependencies

| Category | Library |
|----------|---------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI |
| Auth | Clerk |
| Database | Prisma 6, MongoDB |
| State | TanStack Query, Zustand |
| Forms | React Hook Form, Zod |
| Editor | BlockNote |

---

## 4. Environment Variables

Create `.env` from `.env.example`:

```bash
DATABASE_URL="mongodb+srv://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

---

## 5. Important Notes

- The project uses Next.js 16 with React 19 - watch for breaking changes
- MongoDB Atlas Search is optional - app falls back to Prisma `contains` if unavailable
- No test framework is configured - focus on manual testing
- Use `prisma generate` after modifying schema (runs on `npm install`)
- The app is deployed on Vercel (see live demo in README)