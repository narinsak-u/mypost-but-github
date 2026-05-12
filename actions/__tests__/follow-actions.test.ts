import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toggleFollow, getIsFollowing, getUserFollowers, getUserFollowing } from "../follow-actions";
import { getCurrentSession } from "@/lib/auth-helpers";
import { db as prisma } from "@/lib/prismadb";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/prismadb", () => ({
  db: {
    follow: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("follow-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("toggleFollow", () => {
    it("follows a user when user is authenticated and not already following", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.follow.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.follow.create).mockResolvedValue({
        id: "follow-1",
        followerId: "user-123",
        followingId: "user-456",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await toggleFollow("user-456");

      expect(result).toEqual({ success: true, followed: true });
      expect(prisma.follow.findFirst).toHaveBeenCalledWith({
        where: { followingId: "user-456", followerId: "user-123" },
      });
      expect(prisma.follow.create).toHaveBeenCalledWith({
        data: {
          followerId: "user-123",
          followingId: "user-456",
        },
      });
    });

    it("unfollows a user when user is already following", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.follow.findFirst).mockResolvedValue({
        id: "follow-1",
        followerId: "user-123",
        followingId: "user-456",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.follow.delete).mockResolvedValue({
        id: "follow-1",
        followerId: "user-123",
        followingId: "user-456",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await toggleFollow("user-456");

      expect(result).toEqual({ success: true, followed: false });
      expect(prisma.follow.delete).toHaveBeenCalledWith({
        where: { id: "follow-1" },
      });
    });

    it("returns error when user is not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const result = await toggleFollow("user-456");

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.follow.findFirst).not.toHaveBeenCalled();
    });

    it("returns error when followingId is not provided", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);

      const result = await toggleFollow("");

      expect(result).toEqual({ error: "Following user not found" });
      expect(prisma.follow.findFirst).not.toHaveBeenCalled();
    });

    it("returns error when user tries to follow themselves", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);

      const result = await toggleFollow("user-123");

      expect(result).toEqual({ error: "You cannot follow yourself" });
      expect(prisma.follow.findFirst).not.toHaveBeenCalled();
    });

    it("returns error on internal server error", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.follow.findFirst).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await toggleFollow("user-456");

      expect(result).toEqual({ error: "Could not follow. Please try later" });
    });
  });

  describe("getIsFollowing", () => {
    it("returns true when user is following the target user", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.follow.findFirst).mockResolvedValue({
        id: "follow-1",
        followerId: "user-123",
        followingId: "user-456",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getIsFollowing("user-456");

      expect(result).toEqual({ isFollowing: true });
      expect(prisma.follow.findFirst).toHaveBeenCalledWith({
        where: { followingId: "user-456", followerId: "user-123" },
      });
    });

    it("returns false when user is not following the target user", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.follow.findFirst).mockResolvedValue(null);

      const result = await getIsFollowing("user-456");

      expect(result).toEqual({ isFollowing: false });
    });

    it("returns false when user is not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const result = await getIsFollowing("user-456");

      expect(result).toEqual({ isFollowing: false });
      expect(prisma.follow.findFirst).not.toHaveBeenCalled();
    });

    it("returns false when followingId is not provided", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);

      const result = await getIsFollowing("");

      expect(result).toEqual({ isFollowing: false });
      expect(prisma.follow.findFirst).not.toHaveBeenCalled();
    });

    it("returns false on internal server error", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.follow.findFirst).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await getIsFollowing("user-456");

      expect(result).toEqual({ isFollowing: false });
    });
  });

  describe("getUserFollowers", () => {
    it("returns the correct follower count", async () => {
      vi.mocked(prisma.follow.findMany).mockResolvedValue([
        {
          id: "follow-1",
          followerId: "user-123",
          followingId: "user-456",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "follow-2",
          followerId: "user-789",
          followingId: "user-456",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await getUserFollowers("user-456");

      expect(result).toEqual({ followersCount: 2 });
      expect(prisma.follow.findMany).toHaveBeenCalledWith({
        where: { followingId: "user-456" },
      });
    });

    it("returns 0 when user has no followers", async () => {
      vi.mocked(prisma.follow.findMany).mockResolvedValue([]);

      const result = await getUserFollowers("user-456");

      expect(result).toEqual({ followersCount: 0 });
    });

    it("returns 0 on internal server error", async () => {
      vi.mocked(prisma.follow.findMany).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await getUserFollowers("user-456");

      expect(result).toEqual({ followersCount: 0 });
    });
  });

  describe("getUserFollowing", () => {
    it("returns the correct following count", async () => {
      vi.mocked(prisma.follow.findMany).mockResolvedValue([
        {
          id: "follow-1",
          followerId: "user-123",
          followingId: "user-456",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "follow-2",
          followerId: "user-123",
          followingId: "user-789",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await getUserFollowing("user-123");

      expect(result).toEqual({ followingCount: 2 });
      expect(prisma.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: "user-123" },
      });
    });

    it("returns 0 when user is not following anyone", async () => {
      vi.mocked(prisma.follow.findMany).mockResolvedValue([]);

      const result = await getUserFollowing("user-123");

      expect(result).toEqual({ followingCount: 0 });
    });

    it("returns 0 on internal server error", async () => {
      vi.mocked(prisma.follow.findMany).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await getUserFollowing("user-123");

      expect(result).toEqual({ followingCount: 0 });
    });
  });
});
