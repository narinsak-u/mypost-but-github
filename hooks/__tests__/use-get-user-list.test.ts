import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetUserList } from "../use-get-user-list";

const mockUsers = vi.hoisted(() => [
  { id: "1", firstName: "Alice", lastName: "Smith" },
  { id: "2", firstName: "Bob", lastName: "Jones" },
]);

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: mockUsers } }),
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

describe("useGetUserList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns users on success", async () => {
    const { result } = renderHook(() => useGetUserList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]?.firstName).toBe("Alice");
  });

  it("returns usernames as full names", async () => {
    const { result } = renderHook(() => useGetUserList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.usernames).toEqual(["Alice Smith", "Bob Jones"]);
  });

  it("returns empty arrays when no data", async () => {
    const axios = await import("axios");
    vi.mocked(axios.default.get).mockResolvedValueOnce({ data: { data: [] } });

    const { result } = renderHook(() => useGetUserList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.usernames).toEqual([]);
  });
});
