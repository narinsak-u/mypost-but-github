import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  toggleFollow,
  getIsFollowing,
  getUserFollowers,
  getUserFollowing,
} from "@/actions/follow-actions";
import { db } from "@/lib/prismadb";
import { auth } from "@/lib/auth";

vi.mock("@/lib/prismadb", () => ({
  db: {
    follower: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

describe("toggleFollow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await toggleFollow("user-2");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error if followingId is missing", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    const result = await toggleFollow("");
    expect(result).toEqual({ error: "Following user not found" });
  });

  it("should return error if trying to follow self", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    const result = await toggleFollow("user-1");
    expect(result).toEqual({ error: "You cannot follow yourself" });
  });

  it("should unfollow if already following", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(db.follower.findFirst).mockResolvedValue({
      id: "follow-1",
      followerId: "user-1",
      followingId: "user-2",
    } as any);

    vi.mocked(db.follower.delete).mockResolvedValue({ id: "follow-1" } as any);

    const result = await toggleFollow("user-2");

    expect(db.follower.delete).toHaveBeenCalledWith({
      where: { id: "follow-1" },
    });
    expect(result).toEqual({ success: true, followed: false });
  });

  it("should follow if not already following", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(db.follower.findFirst).mockResolvedValue(null);

    vi.mocked(db.follower.create).mockResolvedValue({
      id: "follow-1",
      followerId: "user-1",
      followingId: "user-2",
    } as any);

    const result = await toggleFollow("user-2");

    expect(db.follower.create).toHaveBeenCalledWith({
      data: {
        followerId: "user-1",
        followingId: "user-2",
      },
    });
    expect(result).toEqual({ success: true, followed: true });
  });
});

describe("getIsFollowing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return false if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await getIsFollowing("user-2");
    expect(result).toEqual({ isFollowing: false });
  });

  it("should return true if following", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(db.follower.findFirst).mockResolvedValue({
      id: "follow-1",
      followerId: "user-1",
      followingId: "user-2",
    } as any);

    const result = await getIsFollowing("user-2");
    expect(result).toEqual({ isFollowing: true });
  });

  it("should return false if not following", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(db.follower.findFirst).mockResolvedValue(null);

    const result = await getIsFollowing("user-2");
    expect(result).toEqual({ isFollowing: false });
  });
});

describe("getUserFollowers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return followers count", async () => {
    vi.mocked(db.follower.findMany).mockResolvedValue([
      { id: "f-1", followerId: "user-2", followingId: "user-1" },
      { id: "f-2", followerId: "user-3", followingId: "user-1" },
    ] as any);

    const result = await getUserFollowers("user-1");
    expect(result).toEqual({ followersCount: 2 });
  });

  it("should return 0 on error", async () => {
    vi.mocked(db.follower.findMany).mockRejectedValue(new Error("DB error"));

    const result = await getUserFollowers("user-1");
    expect(result).toEqual({ followersCount: 0 });
  });
});

describe("getUserFollowing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return following count", async () => {
    vi.mocked(db.follower.findMany).mockResolvedValue([
      { id: "f-1", followerId: "user-1", followingId: "user-2" },
      { id: "f-2", followerId: "user-1", followingId: "user-3" },
      { id: "f-3", followerId: "user-1", followingId: "user-4" },
    ] as any);

    const result = await getUserFollowing("user-1");
    expect(result).toEqual({ followingCount: 3 });
  });

  it("should return 0 on error", async () => {
    vi.mocked(db.follower.findMany).mockRejectedValue(new Error("DB error"));

    const result = await getUserFollowing("user-1");
    expect(result).toEqual({ followingCount: 0 });
  });
});
