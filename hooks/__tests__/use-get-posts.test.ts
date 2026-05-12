import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetPosts } from "../use-get-posts";

const mockPosts = vi.hoisted(() => [
  { id: "1", body: "Post 1", userId: "user1" },
  { id: "2", body: "Post 2", userId: "user2" },
]);

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: mockPosts }),
  },
}));

vi.mock("@/store/use-saved-tab", () => ({
  default: () => ({ isSelected: false }),
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

describe("useGetPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns posts on success", async () => {
    const { result } = renderHook(() => useGetPosts({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.posts).toHaveLength(2);
    expect(result.current.posts[0]?.id).toBe("1");
  });

  it("returns empty array when no data", async () => {
    const axios = await import("axios");
    vi.mocked(axios.default.get).mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useGetPosts({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.posts).toEqual([]);
  });

  it("hasNextPage is true when there are results", async () => {
    const { result } = renderHook(() => useGetPosts({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.hasNextPage).toBe(true);
  });

  it("loadNextPost does not fetch when no next page", async () => {
    const axios = await import("axios");
    vi.mocked(axios.default.get).mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useGetPosts({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    await result.current.loadNextPost();
    expect(result.current.isFetchingNextPage).toBe(false);
  });
});
