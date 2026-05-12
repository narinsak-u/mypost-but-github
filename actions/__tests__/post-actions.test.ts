import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPost, deletePost, toggleLike, toggleStar } from "../post-actions";
import { getCurrentSession } from "@/lib/auth-helpers";
import { db as prisma } from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/prismadb", () => ({
  db: {
    post: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("post-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPost", () => {
    it("creates a post when user is authenticated", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.create).mockResolvedValue({
        id: "post-1",
        userId: "user-123",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createPost({
        title: "Test Post",
        body: "Test body",
        tag: "test",
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: "post-1",
          userId: "user-123",
          title: "Test Post",
        }),
      );
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          title: "Test Post",
          body: "Test body",
          tag: "test",
          likedIds: [],
          saveIds: [],
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns error when user is not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const result = await createPost({
        title: "Test Post",
        body: "Test body",
        tag: "test",
      });

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.post.create).not.toHaveBeenCalled();
    });

    it("returns error when validation fails", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.create).mockImplementation(() => {
        throw new Error("Validation error");
      });

      const result = await createPost({
        title: "Test Post",
        body: "Test body",
        tag: "test",
      });

      expect(result).toEqual(
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
    });

    it("returns error on internal server error", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.create).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await createPost({
        title: "Test Post",
        body: "Test body",
        tag: "test",
      });

      expect(result).toEqual({ error: "Internal server error" });
    });
  });

  describe("deletePost", () => {
    it("deletes a post when user is authenticated and owns the post", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "post-1",
        userId: "user-123",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.post.delete).mockResolvedValue({
        id: "post-1",
        userId: "user-123",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deletePost("post-1");

      expect(result).toBe(true);
      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: "post-1" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns error when user is not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const result = await deletePost("post-1");

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("returns error when post is not found", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

      const result = await deletePost("post-1");

      expect(result).toEqual({ error: "Post not found" });
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("returns error when user does not own the post", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deletePost("post-1");

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("returns error when post ID is invalid", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);

      const result = await deletePost("");

      expect(result).toEqual({ error: "Invalid ID" });
      expect(prisma.post.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("toggleLike", () => {
    it("likes a post when user is authenticated and has not liked before", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.post.update).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: ["user-123"],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await toggleLike("post-1");

      expect(result).toEqual({ hasLiked: true });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: "post-1" },
        data: { likedIds: ["user-123"] },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("unlikes a post when user has already liked", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: ["user-123"],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.post.update).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await toggleLike("post-1");

      expect(result).toEqual({ hasLiked: false });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: "post-1" },
        data: { likedIds: [] },
      });
    });

    it("returns error when user is not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const result = await toggleLike("post-1");

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it("returns error when post is not found", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

      const result = await toggleLike("post-1");

      expect(result).toEqual({ error: "Post not found" });
      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it("returns error when post ID is invalid", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);

      const result = await toggleLike("");

      expect(result).toEqual({ error: "Invalid ID" });
      expect(prisma.post.findUnique).not.toHaveBeenCalled();
    });

    it("returns error on internal server error", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.post.update).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await toggleLike("post-1");

      expect(result).toEqual({ error: "Internal server error" });
    });
  });

  describe("toggleStar", () => {
    it("stars a post when user is authenticated and has not starred before", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.post.update).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: ["user-123"],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await toggleStar("post-1");

      expect(result).toEqual({ hasStarred: true });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: "post-1" },
        data: { saveIds: ["user-123"] },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("unstars a post when user has already starred", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: ["user-123"],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.post.update).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await toggleStar("post-1");

      expect(result).toEqual({ hasStarred: false });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: "post-1" },
        data: { saveIds: [] },
      });
    });

    it("returns error when user is not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const result = await toggleStar("post-1");

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it("returns error when post is not found", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

      const result = await toggleStar("post-1");

      expect(result).toEqual({ error: "Post not found" });
      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it("returns error when post ID is invalid", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);

      const result = await toggleStar("");

      expect(result).toEqual({ error: "Invalid ID" });
      expect(prisma.post.findUnique).not.toHaveBeenCalled();
    });

    it("returns error on internal server error", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue({
        id: "post-1",
        userId: "user-456",
        title: "Test Post",
        body: "Test body",
        tag: "test",
        likedIds: [],
        saveIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.post.update).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await toggleStar("post-1");

      expect(result).toEqual({ error: "Internal server error" });
    });
  });
});
