import { describe, it, expect, vi } from "vitest";

vi.mock("@prisma/client", () => ({}));

import { renderHook } from "@testing-library/react";
import usePostCount from "../use-post-count";

describe("usePostCount", () => {
  it("counts posts per user", () => {
    const posts: any = [
      { userId: "user1" },
      { userId: "user1" },
      { userId: "user2" },
    ];
    const { result } = renderHook(() => usePostCount({ posts }));
    expect(result.current.userPostCount).toEqual({ user1: 2, user2: 1 });
  });

  it("returns empty object for empty posts", () => {
    const posts: any = [];
    const { result } = renderHook(() => usePostCount({ posts }));
    expect(result.current.userPostCount).toEqual({});
  });
});
