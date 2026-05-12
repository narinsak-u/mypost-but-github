import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useCreatePost from "../use-create-post";

const mockCreatedPost = vi.hoisted(() => ({
  id: "1",
  body: "New post",
  userId: "user1",
}));

vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: mockCreatedPost }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useCreatePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a post successfully", async () => {
    const { result } = renderHook(() => useCreatePost(), {
      wrapper: createWrapper(),
    });

    const created = await result.current.createPost({
      title: "Test",
      body: "Hello",
      tag: "general",
    });

    expect(created).toEqual(mockCreatedPost);
  });

  it("is pending initially false", () => {
    const { result } = renderHook(() => useCreatePost(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
  });
});
