import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLike, useSavePost } from "../use-toggle-post";

const basePost = {
  id: "post-1",
  title: "Test",
  body: "Test post",
  tag: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user-1",
  likedIds: [] as string[],
  saveIds: [] as string[],
  comments: [],
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: () => ({
    data: { user: { id: "user-1" } },
    isPending: false,
  }),
}));

vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ status: 200 }),
    delete: vi.fn().mockResolvedValue({ status: 200 }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useLike", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns hasLiked as false when user not in likedIds", () => {
    const { result } = renderHook(() => useLike({ post: basePost as any }), {
      wrapper: createWrapper(),
    });

    expect("hasLiked" in result.current && result.current.hasLiked()).toBe(
      false,
    );
  });

  it("returns hasLiked as true when user is in likedIds", () => {
    const { result } = renderHook(
      () => useLike({ post: { ...basePost, likedIds: ["user-1"] } as any }),
      { wrapper: createWrapper() },
    );

    expect("hasLiked" in result.current && result.current.hasLiked()).toBe(
      true,
    );
  });
});

describe("useSavePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns hasSaved as false when user not in saveIds", () => {
    const { result } = renderHook(
      () => useSavePost({ post: basePost as any }),
      {
        wrapper: createWrapper(),
      },
    );

    expect("hasSaved" in result.current && result.current.hasSaved()).toBe(
      false,
    );
  });

  it("returns hasSaved as true when user is in saveIds", () => {
    const { result } = renderHook(
      () => useSavePost({ post: { ...basePost, saveIds: ["user-1"] } as any }),
      { wrapper: createWrapper() },
    );

    expect("hasSaved" in result.current && result.current.hasSaved()).toBe(
      true,
    );
  });
});
