import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useCreateComment from "../use-create-commnet";

const mockPost = {
  id: "post-1",
  title: "Test",
  body: null,
  tag: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user-1",
  likedIds: [],
  saveIds: [],
} as any;

vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ status: 200 }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useCreateComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a comment successfully", async () => {
    const { result } = renderHook(() => useCreateComment(mockPost), {
      wrapper: createWrapper(),
    });

    const res = await result.current.createComment({ body: "Nice post!" });
    expect(res).toBeDefined();
  });

  it("calls the correct API endpoint", async () => {
    const axios = await import("axios");
    const { result } = renderHook(() => useCreateComment(mockPost), {
      wrapper: createWrapper(),
    });

    await result.current.createComment({ body: "Great!" });
    expect(vi.mocked(axios.default.post)).toHaveBeenCalledWith(
      "/api/post/post-1/comment",
      { body: "Great!" },
    );
  });

  it("returns isPending initially false", () => {
    const { result } = renderHook(() => useCreateComment(mockPost), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
  });
});
