import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createComment, deleteComment } from "../comment-actions";
import { getCurrentSession } from "@/lib/auth-helpers";
import { db as prisma } from "@/lib/prismadb";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/prismadb", () => ({
  db: {
    post: {
      findUnique: vi.fn(),
    },
    comment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("comment-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createComment", () => {
    it("creates a comment when user is authenticated", async () => {
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
      vi.mocked(prisma.comment.create).mockResolvedValue({
        id: "comment-1",
        postId: "post-1",
        userId: "user-123",
        body: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createComment({
        postId: "post-1",
        body: "Test comment",
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: "comment-1",
          postId: "post-1",
          userId: "user-123",
          body: "Test comment",
        }),
      );
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: "post-1" },
      });
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId: "post-1",
          body: "Test comment",
          userId: "user-123",
        },
      });
    });

    it("returns error when user is not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const result = await createComment({
        postId: "post-1",
        body: "Test comment",
      });

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.post.findUnique).not.toHaveBeenCalled();
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it("returns error when post is not found", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

      const result = await createComment({
        postId: "post-1",
        body: "Test comment",
      });

      expect(result).toEqual({ error: "Post not found" });
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it("returns error when validation fails", async () => {
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
      vi.mocked(prisma.comment.create).mockImplementation(() => {
        throw new Error("Validation error");
      });

      const result = await createComment({
        postId: "post-1",
        body: "Test comment",
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
      vi.mocked(prisma.comment.create).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await createComment({
        postId: "post-1",
        body: "Test comment",
      });

      expect(result).toEqual({
        error: "Could not create comment. Please try later",
      });
    });
  });

  describe("deleteComment", () => {
    it("deletes a comment when user is authenticated and owns the comment", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.comment.findUnique).mockResolvedValue({
        id: "comment-1",
        postId: "post-1",
        userId: "user-123",
        body: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.comment.delete).mockResolvedValue({
        id: "comment-1",
        postId: "post-1",
        userId: "user-123",
        body: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deleteComment("comment-1");

      expect(result).toBe(true);
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: "comment-1" },
      });
    });

    it("returns error when user is not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null);

      const result = await deleteComment("comment-1");

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.comment.findUnique).not.toHaveBeenCalled();
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it("returns error when comment is not found", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.comment.findUnique).mockResolvedValue(null);

      const result = await deleteComment("comment-1");

      expect(result).toEqual({ error: "Comment not found" });
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it("returns error when user does not own the comment", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.comment.findUnique).mockResolvedValue({
        id: "comment-1",
        postId: "post-1",
        userId: "user-456",
        body: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await deleteComment("comment-1");

      expect(result).toEqual({ error: "Unauthorized" });
      expect(prisma.comment.delete).not.toHaveBeenCalled();
    });

    it("returns error on internal server error", async () => {
      const mockSession = { user: { id: "user-123" } };
      vi.mocked(getCurrentSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.comment.findUnique).mockResolvedValue({
        id: "comment-1",
        postId: "post-1",
        userId: "user-123",
        body: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.comment.delete).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await deleteComment("comment-1");

      expect(result).toEqual({
        error: "Could not delete comment. Please try later",
      });
    });
  });
});
