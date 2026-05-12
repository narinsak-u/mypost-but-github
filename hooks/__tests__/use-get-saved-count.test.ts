import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useGetSavedCount from "../use-get-saved-count";

const mockCountPosts = vi.hoisted(() => [
  {
    id: "1",
    title: "",
    body: "Post 1",
    tag: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "",
    likedIds: [],
    saveIds: ["user-a", "user-b"],
  },
  {
    id: "2",
    title: "",
    body: "Post 2",
    tag: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "",
    likedIds: [],
    saveIds: ["user-a"],
  },
  {
    id: "3",
    title: "",
    body: "Post 3",
    tag: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "",
    likedIds: [],
    saveIds: [],
  },
]);

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: mockCountPosts }),
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

describe("useGetSavedCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns saved counts grouped by user", async () => {
    const { result } = renderHook(() => useGetSavedCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(Object.keys(result.current.savedCount).length).toBeGreaterThan(0);
    });

    expect(result.current.savedCount).toEqual({
      "user-a": 2,
      "user-b": 1,
    });
  });

  it("returns empty object when no posts", async () => {
    const axios = await import("axios");
    vi.mocked(axios.default.get).mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useGetSavedCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.savedCount).toEqual({}));
  });
});
