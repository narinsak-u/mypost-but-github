import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USER_ID = "d57G0hkPAeAwKxGY6TvcI35je3TxC5DB";

const posts = [
  {
    title: "Why TypeScript is a game changer for large codebases",
    body: "After years of using plain JavaScript, switching to TypeScript has been transformative. Type safety catches entire categories of bugs at compile time. The developer experience with autocomplete and refactoring tools is unmatched. If you're working on a team with more than 2 developers, TypeScript should be your default choice.",
    tag: "typescript",
  },
  {
    title: "Understanding React Server Components",
    body: "React Server Components are a paradigm shift. They run exclusively on the server, reducing the client-side JavaScript bundle. Combined with Server Actions, they enable a new pattern where you can fetch data and render HTML without shipping heavy client-side logic. The key is understanding when to use 'use client' vs keeping things on the server.",
    tag: "react",
  },
  {
    title: "The power of Prisma with MongoDB",
    body: "Prisma provides a type-safe ORM that works beautifully with MongoDB. The schema-first approach means your database schema is the source of truth. Combined with the Prisma client, you get autocomplete in your IDE, which drastically reduces errors. MongoDB's flexible document model pairs well with Prisma's relational-like query API.",
    tag: "prisma",
  },
  {
    title: "Why I switched from REST to tRPC",
    body: "tRPC gives you end-to-end type safety without the boilerplate of GraphQL or the manual typing of REST. You define your API on the server and get fully typed clients for free. Combined with Next.js App Router, it's the most productive stack I've worked with. No more manually writing fetch calls with typed responses.",
    tag: "api",
  },
  {
    title: "Tailwind CSS v4 first impressions",
    body: "Tailwind v4 brings CSS-first configuration, removing the need for tailwind.config.js. It uses CSS variables and @theme directives, making it feel more native to the platform. The new OKLCH color system is a huge improvement for accessibility and design consistency. Migration was surprisingly smooth from v3.",
    tag: "css",
  },
  {
    title: "Better Auth vs NextAuth: my experience",
    body: "Recently migrated from NextAuth to Better Auth and the developer experience is night and day. Better Auth has first-class support for organizations, two-factor auth, and a cleaner plugin system. The TypeScript support is excellent. If you're starting a new project, I'd recommend Better Auth over NextAuth.",
    tag: "auth",
  },
  {
    title: "Tips for writing cleaner React hooks",
    body: "1. Keep hooks focused on a single concern. 2. Use custom hooks to encapsulate complex logic. 3. Avoid unnecessary useEffects - derive state when possible. 4. Memoize callbacks and values only when needed, not by default. 5. Extract data fetching into dedicated hooks like useQuery. Clean hooks make your components predictable and testable.",
    tag: "react",
  },
  {
    title: "GitHub Copilot vs Cursor: which AI coding tool wins?",
    body: "After using both extensively, Cursor has better context awareness and inline editing capabilities. Copilot excels at code completion speed and has better chat integration in VS Code. For complex refactoring tasks, Cursor's agent mode is impressive. But Copilot's integration with GitHub ecosystem gives it an edge for PR reviews.",
    tag: "tools",
  },
  {
    title: "Why your MongoDB queries are slow (and how to fix them)",
    body: "Common MongoDB performance pitfalls: missing indexes on frequently queried fields, using $lookup without proper pipeline optimization, not using projections to limit returned fields, and aggregation pipelines that process more data than needed. Always use explain() to analyze your queries and add compound indexes for multi-field queries.",
    tag: "database",
  },
  {
    title: "Building a social media app with Next.js and Better Auth",
    body: "Just finished building a mini social media platform inspired by GitHub and Pantip. The stack: Next.js 16 App Router, Better Auth for authentication, Prisma with MongoDB, and Tailwind CSS. The combination of Server Actions for mutations and TanStack Query for data fetching makes the app feel snappy. Better Auth handles email/password and OAuth seamlessly.",
    tag: "fullstack",
  },
];

const comments = [
  "Great post! Really insightful take on this topic.",
  "I've been thinking about this too. Thanks for sharing your experience.",
  "Could you elaborate on the performance implications?",
  "This is exactly what I needed. Saved for later!",
  "Have you tried comparing this with other alternatives?",
  "Solid advice. I wish I knew this earlier.",
  "One thing to add: error handling is crucial in production.",
  "Interesting perspective. I had a different experience though.",
  "Bookmarked. This will help with my current project.",
  "Well written! Looking forward to more content like this.",
];

async function seed() {
  console.log("Seeding posts...");

  for (let i = 0; i < posts.length; i++) {
    const postData = posts[i]!;

    const post = await prisma.post.create({
      data: {
        userId: USER_ID,
        title: postData.title,
        body: postData.body,
        tag: postData.tag,
        likedIds: [],
        starIds: [],
      },
    });

    console.log(`  Created post ${i + 1}/10: ${post.id}`);

    // Add 2-4 comments per post
    const commentCount = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < commentCount; j++) {
      const commentText =
        comments[Math.floor(Math.random() * comments.length)]!;
      await prisma.comment.create({
        data: {
          postId: post.id,
          body: commentText,
          userId: USER_ID,
        },
      });
    }
    console.log(`    Added ${commentCount} comments`);

    // Add likes (the user's own ID, simulating self-like for seed data)
    const likeCount = 1 + Math.floor(Math.random() * 5);
    const fakeLikerIds = Array.from(
      { length: likeCount },
      (_, k) => `fake-user-${k + 1}-${i}`,
    );
    await prisma.post.update({
      where: { id: post.id },
      data: { likedIds: [USER_ID, ...fakeLikerIds] },
    });
    console.log(`    Added ${likeCount + 1} likes`);
  }

  console.log("\nSeed complete!");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
