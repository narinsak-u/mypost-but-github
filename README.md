![mypost-but-github](https://socialify.git.ci/alohadancemeow/mypost-but-github/image?forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Light)

# mypost-but-github ✌️
A mini webboard inspired by GitHub + Pantip. 🚀

Live demo: https://mypost-but-github.vercel.app 

### 🎉 Objective:

- **Knowledge Sharing**: Users can create posts to share ideas, questions, and solutions with the community.
- **Engagement**: Foster interaction through functionalities like liking, commenting, and starring posts.

## ✨ Features

- Clerk authentication (sign in / sign up)
- Create posts (rich text editor), optional tags
- Feed with tabs (For You / Following)
- Like + Star posts
- Comments
- Follow / unfollow users
- User profiles (overview + starred)
- Search users and posts (Atlas Search when available; falls back to Prisma contains query)

### 🍀 Technologies

- Development: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/docs/installation), [Shadcn/ui](https://ui.shadcn.com/) 
- Database: [MongoDB](https://www.mongodb.com/) with [Prisma](https://www.prisma.io/) for data modeling and interactions
- Data Fetching: [TanStack Query (React Query)](https://tanstack.com/query/latest) for efficient data retrieval and management
- Authentication: [Clerk](https://clerk.com/) for secure user login and management
- Content Editing: [Blocknote](https://www.blocknotejs.org/) for a user-friendly content creation experience

## Getting started

### 1) Install

```bash
npm install
```

### 2) Environment variables

Copy `.env.example` to `.env` and set the values you actually use.

This project uses Clerk (not NextAuth). If your `.env.example` still contains NextAuth variables, you can ignore them.

Required:

```bash
DATABASE_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

### 3) Prisma

This repo runs `prisma generate` on install. To sync the schema to your database:

```bash
npx prisma db push
```

### 4) Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run Next.js lint

## MongoDB Atlas Search (optional)

Post search uses a MongoDB Atlas `$search` autocomplete pipeline when available (index name: `default` on the `Post` collection). If Atlas Search is not configured, the app automatically falls back to a Prisma `contains` search.

### 1. Enable Atlas Search (UI)

1. Go to MongoDB Atlas
2. Select your cluster
3. Click Search
4. Click Create Search Index
5. Choose:
   - Database
   - Collection (eg. Post)
6. Use JSON editor

**Example Search Index Definition:**
```js
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": {
        "type": "autocomplete"
      },
      "body": {
        "type": "string"
      }
    }
  }
}
```
- "type": "autocomplete" - Perfect for search-as-you-type.


**Highlight Search Results (Useful for UI highlighting):**
```js
$search: {
  text: {
    query: "next",
    path: ["title", "body"]
  },
  highlight: {
    path: ["title", "body"]
  }
}
```

### 2. Use Atlas Search with Prisma:
```ts
// actions/search-posts-atlas.ts

"use server";

import { prisma } from "@/lib/prisma";

export async function searchPostsAutocomplete(query: string) {
  if (!query) return [];

  const result = await prisma.$runCommandRaw({
    aggregate: "Post",
    pipeline: [
      {
        $search: {
          index: "default",
          autocomplete: {
            query,
            path: "title",
            fuzzy: {
              maxEdits: 1
            }
          },
          highlight: {
             path: ["title", "body"],
          },
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          highlights: { $meta: "searchHighlights" },
          score: { $meta: "searchScore" }
        }
      },
      { $limit: 8 }
    ],
    cursor: {}
  });

  return result.cursor.firstBatch as any[];
}
```

- Prisma does not directly support `$search`
- But Prisma lets you run raw MongoDB commands
- read more: [Atlas Search](https://www.mongodb.com/products/platform/atlas-search)

## ✅ What You Now Have

- ✅ Next.js (App Router)
- ✅ MongoDB Atlas Search (search-as-you-type)
- ✅ Prisma (MongoDB)
- ✅ Server Actions
- ✅ Debounced real-time UI
- ✅ Highlighted matched text
- ✅ Keyboard navigation

## Screenshots

![Home](/frontend/public/screenshot.png)
