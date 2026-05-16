export const queryKeys = {
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
    detail: (userId: string) =>
      [...queryKeys.users.all, "detail", userId] as const,
  },
  posts: {
    all: ["posts"] as const,
    list: (tab?: string, userId?: string, limit?: number) =>
      ["posts", "list", tab ?? "all", userId ?? "all", limit ?? 10] as const,
    infinite: (tab?: string, userId?: string, limit?: number) =>
      [
        "posts",
        "infinite",
        tab ?? "all",
        userId ?? "all",
        limit ?? 10,
      ] as const,
  },
  conversations: {
    all: ["conversations"] as const,
  },
  messages: {
    all: ["messages"] as const,
    byConversation: (conversationId: string) =>
      [...queryKeys.messages.all, conversationId] as const,
  },
  comments: {
    all: ["comments"] as const,
    byPost: (postId: string) => [...queryKeys.comments.all, postId] as const,
  },
};
