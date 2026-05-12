# AGENTS.md - Codebase Guidelines for AI Agents

## Project Overview

This is a social media platform built with Next.js 16, TypeScript, and PostgreSQL (via Prisma). It uses the App Router, TanStack Query for server state, and Better Auth for authentication.

> See [SKILLS.md](./SKILLS.md) for recommended agent skills for this project.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client (runs automatically on postinstall)
npx prisma generate

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Apply database migrations
npx prisma migrate dev

# Push schema to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Running a Single Test

This project does not currently have a test framework configured. If adding tests:

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- path/to/test   # Run specific test file
```

## Code Style Guidelines

### Imports

1. **Use the `@/` path alias** for internal imports (configured in tsconfig.json)
2. **Group imports** in this order:
   - React core imports
   - External libraries
   - Internal components/hooks/utils (`@/` prefixed)
   - Types/interfaces
   - Relative imports (last resort)

```typescript
// Good
import * as React from "react";
import { useState } from "react";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PostPopulated } from "@/types";
import { cn } from "@/lib/utils";
import useSavedTab from "../store/use-saved-tab";

// Bad - avoid relative paths when @/ alias is available
import { cn } from "../../lib/utils";
```

### Formatting

1. **Use Prettier** for code formatting (already configured)
2. **Use the Prettier Tailwind plugin** for class sorting
3. **Use `cn()` utility** for merging Tailwind classes:
   ```typescript
   import { cn } from "@/lib/utils";
   // Usage: <div className={cn("base-class", condition && "conditional-class")} />
   ```

### TypeScript Conventions

1. **Strict mode is enabled** - avoid `any`, use proper types
2. **Use interface for object shapes** that may be extended:
   ```typescript
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?:
       | "default"
       | "destructive"
       | "outline"
       | "secondary"
       | "ghost"
       | "link";
     size?: "default" | "sm" | "lg" | "icon";
   }
   ```
3. **Use type for unions, utility types**:
   ```typescript
   type Props = { limit?: number; userId?: string };
   ```
4. **Export types alongside components** when they're used externally:
   ```typescript
   export type { ButtonProps }; // Named export for interfaces
   export { Button }; // Default or named exports for components
   ```
5. **`noUncheckedIndexedAccess` is enabled** - handle array access safely:
   ```typescript
   const posts = data?.pages.flatMap((page) => page) ?? [];
   ```

### Naming Conventions

| Element            | Convention                    | Example                              |
| ------------------ | ----------------------------- | ------------------------------------ |
| Components         | PascalCase                    | `PostItem.tsx`, `CommentSection.tsx` |
| Hooks              | camelCase with `use` prefix   | `useGetPosts.ts`, `useCreatePost.ts` |
| Utilities          | camelCase                     | `cn()`, `formatDate()`               |
| Types/Interfaces   | PascalCase                    | `PostPopulated`, `UserProfile`       |
| Files (utilities)  | kebab-case or camelCase       | `utils.ts`, `use-format-date.tsx`    |
| Files (components) | PascalCase matching component | `Button.tsx`                         |
| Directories        | kebab-case                    | `components/ui/`, `hooks/`           |

### React Component Patterns

1. **Client components** require `"use client"` directive at the top
2. **Use functional components** with explicit prop typing
3. **Forward refs** when needed (e.g., button components):
   ```typescript
   const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
     ({ className, ...props }, ref) => {
       return <button ref={ref} className={className} {...props} />
     }
   )
   Button.displayName = "Button"
   ```
4. **CVA (class-variance-authority)** for component variants:
   ```typescript
   const buttonVariants = cva("base-class", {
     variants: { variant: { default: "...", outline: "..." } },
     defaultVariants: { variant: "default" },
   });
   ```

### API Routes (Next.js App Router)

1. **Use Zod for request validation**
2. **Return appropriate HTTP status codes**:
   - `200` - Success
   - `400` - Bad Request (validation errors)
   - `401` - Unauthorized
   - `404` - Not Found
   - `500` - Server Error
3. **Use `NextResponse`** for JSON responses
4. **Handle errors with try/catch**:
   ```typescript
   try {
     const posts = await prisma.post.findMany(...)
     return NextResponse.json(posts)
   } catch (error) {
     if (error instanceof z.ZodError) {
       return new Response(error.message, { status: 400 })
     }
     return new NextResponse("Internal error", { status: 500 })
   }
   ```

### Database (Prisma)

1. **Use the `db` export** from `@/lib/prismadb` (singleton instance)
2. **Include related data** using Prisma's `include` option
3. **Use `select`** when you don't need all fields (performance)
4. **Use `revalidatePath`** or `revalidateTag` after mutations

### Error Handling

1. **Zod validation errors** - return 400 with error message
2. **Prisma errors** - return 500 with generic message (don't leak DB details)
3. **Use `sonner` toasts** for user-facing notifications:
   ```typescript
   import { toast } from "sonner";
   toast.success("Post created!");
   toast.error("Failed to create post");
   ```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── (contents)/        # Route group (no layout change)
│   └── (userProfile)/     # Route group for user pages
├── components/
│   ├── ui/               # Shadcn/ui style primitives
│   ├── contents/         # Page section components
│   ├── comments/         # Comment-related components
│   ├── posts/            # Post-related components
│   └── editor/           # Editor components (BlockNote)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (prismadb.ts, utils.ts)
├── store/                 # Zustand stores
├── actions/               # Server actions
├── types/                 # TypeScript type definitions
├── data/                  # Static data
├── prisma/                # Prisma schema & migrations
├── providers/             # React providers
├── public/                # Static assets
├── site/                  # Site metadata
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript config
├── next.config.js         # Next.js config
└── postcss.config.mjs     # PostCSS config
```

## Common Patterns

### Zustand Store (client state)

```typescript
// store/use-saved-tab.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedTabStore {
  isSelected: boolean;
  toggle: () => void;
}

export const useSavedTab = create<SavedTabStore>()(
  persist(
    (set) => ({
      isSelected: false,
      toggle: () => set((s) => ({ isSelected: !s.isSelected })),
    }),
    { name: "saved-tab" },
  ),
);
```

### TanStack Query Hook

```typescript
// hooks/use-get-posts.ts
"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetPosts = ({ limit }: Props) => {
  return useInfiniteQuery({
    queryKey: ["posts-query"],
    queryFn: async ({ pageParam }) => {
      const { data } = await axios.get(
        `/api/posts?page=${pageParam}&limit=${limit}`,
      );
      return data as PostPopulated[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.length > 0 ? page + 1 : null),
  });
};
```
