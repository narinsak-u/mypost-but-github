# Project: mypost-but-github

A mini social media application inspired by GitHub, built for learning frontend and backend development.

## Project Overview

- **Purpose:** A social platform where users can create posts, comment, follow others, and "star" or "like" content, mimicking GitHub's social interactions.
- **Architecture:** Next.js 16 (App Router) with Server Actions for data mutations and TanStack Query for client-side state/fetching.
- **Authentication:** [Better Auth](https://www.better-auth.com/) providing email/password and social login (Google, GitHub) via a custom Shadcn UI modal.
- **Database:** MongoDB managed through [Prisma ORM](https://www.prisma.io/).
- **Styling:** Tailwind CSS 4 with Shadcn UI components and Radix UI primitives.

## Key Technologies

- **Frontend:** Next.js, React 19, Tailwind CSS 4, Radix UI, Shadcn UI, Zustand, TanStack Query.
- **Backend:** Next.js Server Actions, Prisma ORM, MongoDB.
- **Authentication:** Better Auth.
- **Icons:** Lucide React, Tabler Icons.
- **Validation:** Zod.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (Atlas or local)
- Environment variables configured in `.env` (see below)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb+srv://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

### Building and Running

| Task | Command |
| :--- | :--- |
| **Development** | `npm run dev` |
| **Build** | `npm run build` |
| **Start Production** | `npm run start` |
| **Linting** | `npm run lint` |
| **Prisma Sync** | `npx prisma db push` |
| **Prisma Generate** | `npx prisma generate` |

## Project Structure

- `actions/`: Next.js Server Actions for database mutations (posts, comments, follows).
- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components.
  - `ui/`: Shadcn UI base components.
  - `auth/`: Authentication-related components (LoginModal).
- `hooks/`: Custom React hooks for data fetching and application logic.
- `lib/`: Shared utilities, including Prisma client (`prismadb.ts`) and Auth configuration (`auth.ts`).
- `prisma/`: Database schema and seed scripts.
- `store/`: Zustand store definitions for client-side state management.
- `types/`: TypeScript interfaces and Zod schemas.

## Development Conventions

- **Data Mutations:** Prefer Server Actions in the `actions/` directory. Use Zod for input validation.
- **Data Fetching:** Use TanStack Query (React Query) for client-side fetching and caching.
- **Styling:** Adhere to Tailwind CSS 4 patterns. Use Shadcn UI components for consistent design.
- **Authentication:** Use `auth.api.getSession` for server-side auth and `useAuth` (from Better Auth client) for client-side auth.
- **Database:** Use `cuid()` for User/Session/Account IDs and MongoDB `ObjectId` for Post/Comment/Follower models as defined in `schema.prisma`.
