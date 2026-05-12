import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useInvalidationKeys,
  useCreateMutation,
  useDeleteMutation,
  useToggleMutation,
} from "../use-mutation-utils";

vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ status: 200 }),
    delete: vi.fn().mockResolvedValue({ status: 200 }),
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

describe("useInvalidationKeys", () => {
  it("returns like invalidation keys", () => {
    const { result } = renderHook(() => useInvalidationKeys("like"), {
      wrapper: createWrapper(),
    });
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("returns save invalidation keys", () => {
    const { result } = renderHook(() => useInvalidationKeys("save"), {
      wrapper: createWrapper(),
    });
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("returns delete invalidation keys", () => {
    const { result } = renderHook(() => useInvalidationKeys("delete"), {
      wrapper: createWrapper(),
    });
    expect(result.current.length).toBeGreaterThan(0);
  });
});

describe("useCreateMutation", () => {
  it("returns createPost and isPending", () => {
    const { result } = renderHook(
      () => useCreateMutation({ invalidateKeys: [["posts"]] }),
      { wrapper: createWrapper() },
    );

    expect(result.current.createPost).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
  });
});

describe("useDeleteMutation", () => {
  it("returns deletePost and isPending", () => {
    const { result } = renderHook(
      () => useDeleteMutation({ invalidateKeys: [["posts"]] }),
      { wrapper: createWrapper() },
    );

    expect(result.current.deletePost).toBeInstanceOf(Function);
    expect(result.current.isPending).toBe(false);
  });
});

describe("useToggleMutation", () => {
  it("returns addAction and removeAction", () => {
    const { result } = renderHook(
      () =>
        useToggleMutation({ endpoint: "/like", invalidateKeys: [["posts"]] }),
      { wrapper: createWrapper() },
    );

    expect(result.current.addAction).toBeInstanceOf(Function);
    expect(result.current.removeAction).toBeInstanceOf(Function);
  });
});
