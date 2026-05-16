![mypost-but-github](https://socialify.git.ci/alohadancemeow/mypost-but-github/image?forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Light)

# mypost-but-github

A mini social webboard inspired by GitHub + Pantip. Share ideas, ask questions, and engage with the community through posts, comments, and real-time messaging.

**Live demo:** https://mypost-but-github.vercel.app

## Features

### Posts & Content

- **Rich text editor** powered by BlockNote for creating formatted posts
- **Optional tags** to categorize content
- **Feed tabs** — "For You" (all posts) and "Following" (posts from followed users)
- **Like & Star** posts to bookmark and show appreciation
- **Comments** on posts with inline reply support
- **Full post view** at `/post/[postId]`

### Social

- **Follow / unfollow** users to curate your feed
- **User profiles** with overview and starred posts tabs
- **Who to Follow** suggestions on the home page
- **Real-time direct messaging** with conversation list and message threads

### Search

- **Search users and posts** with debounced real-time results
- **MongoDB Atlas Search** for autocomplete with highlighted matches (falls back to Prisma `contains` query when Atlas is not available)

### Authentication & UX

- **Email/password + OAuth** (Google, GitHub) via Better Auth
- **Dark theme** optimized for readability
- **Responsive design** — works on mobile and desktop
- **Keyboard navigation** and accessible UI components

## Tech Stack

| Category  | Technologies                              |
| --------- | ----------------------------------------- |
| Framework | Next.js 16 (App Router), React 19         |
| Styling   | Tailwind CSS 4, shadcn/ui, Radix UI       |
| Auth      | Better Auth                               |
| Database  | MongoDB + Prisma 6                        |
| State     | TanStack Query (server), Zustand (client) |
| Forms     | React Hook Form + Zod                     |
| Editor    | BlockNote                                 |
| Testing   | Vitest + React Testing Library            |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
DATABASE_URL="mongodb+srv://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

### 3. Sync database

```bash
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Available Scripts

| Command             | Description             |
| ------------------- | ----------------------- |
| `npm run dev`       | Start dev server        |
| `npm run build`     | Production build        |
| `npm run start`     | Start production server |
| `npm run lint`      | Run Next.js ESLint      |
| `npm run test`      | Run Vitest tests        |
| `npx prisma studio` | Open database GUI       |

## Project Structure

```
├── actions/           # Server Actions
├── app/               # Next.js App Router pages
│   ├── (home)/        # Home feed
│   ├── (userProfile)/ # User profiles
│   ├── post/          # Individual post view
│   └── api/           # API routes (posts, auth, user)
├── components/        # React components
│   ├── ui/            # shadcn/ui primitives
│   ├── posts/         # Post rendering
│   ├── comments/      # Comment system
│   ├── chat/          # Direct messaging
│   └── nav/           # Navigation & search
├── hooks/             # Custom React hooks
├── lib/               # Utilities (Prisma, auth, utils)
├── providers/         # React context providers
├── store/             # Zustand stores
├── types/             # TypeScript types + Zod validators
└── prisma/            # Database schema
```

## MongoDB Atlas Search (Optional)

Post search uses MongoDB Atlas `$search` autocomplete when available (index name: `default` on the `Post` collection). If not configured, the app falls back to Prisma `contains` search.

### Create Search Index

1. Go to MongoDB Atlas → your cluster → Search
2. Click **Create Search Index**
3. Select database and collection (`Post`)
4. Use JSON editor:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": { "type": "autocomplete" },
      "body": { "type": "string" }
    }
  }
}
```

### Highlight Search Results

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

> Note: Prisma doesn't natively support `$search`, but you can run raw MongoDB commands via `prisma.$runCommandRaw()`. See [Atlas Search docs](https://www.mongodb.com/products/platform/atlas-search) for more.

## Screenshots

![Home](/public/screenshot.png)
