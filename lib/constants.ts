export const QUERY_TIMES = {
  CONVERSATIONS_REFETCH: 5000,
  MESSAGES_REFETCH: 3000,
  POSTS_STALE_TIME: 1000 * 60 * 5,
  POSTS_GC_TIME: 1000 * 60 * 30,
} as const;

export const UI = {
  MAX_SEARCH_RESULTS: 8,
  SEARCH_DEBOUNCE_MS: 250,
  AVATAR_FALLBACK: "https://github.com/shadcn.png",
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  DEFAULT_PAGE: 1,
} as const;
