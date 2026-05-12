export const queryKeys = {
  posts: {
    all: ["posts-query"] as const,
    detail: (id: string) => ["posts-query", id] as const,
    saved: ["posts-query", "saved-posts"] as const,
    byUser: (userId: string) => ["posts-query", "user", userId] as const,
  },
  users: {
    all: ["fetch-user-list"] as const,
    detail: (id: string) => ["fetch-user", id] as const,
  },
  counts: {
    saved: ["saved-count"] as const,
    posts: ["post-count"] as const,
  },
} as const;
