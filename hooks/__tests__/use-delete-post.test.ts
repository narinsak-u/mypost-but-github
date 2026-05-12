import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useDeletePost from "../use-delete-post";

vi.mock("axios", () => ({
  default: {
    delete: vi.fn().mockResolvedValue({ status: 200 }),
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

describe("useDeletePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a post successfully", async () => {
    const { result } = renderHook(() => useDeletePost(), {
      wrapper: createWrapper(),
    });

    const res = await result.current.deletePost("post-1");
    expect(res).toBeDefined();
  });

  it("calls delete API with post id", async () => {
    const axios = await import("axios");
    const { result } = renderHook(() => useDeletePost(), {
      wrapper: createWrapper(),
    });

    await result.current.deletePost("post-123");
    expect(vi.mocked(axios.default.delete)).toHaveBeenCalledWith(
      "/api/post/post-123",
    );
  });

  it("returns isPending initially false", () => {
    const { result } = renderHook(() => useDeletePost(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
  });
});
