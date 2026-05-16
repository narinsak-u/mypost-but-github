import { describe, it, expect, vi, beforeEach } from "vitest";
import { createComment, deleteComment } from "@/actions/comment-actions";
import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";

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

describe("createComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await createComment({ postId: "post-1", body: "Comment" });
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error if post not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

    const result = await createComment({ postId: "post-1", body: "Comment" });
    expect(result).toEqual({ error: "Post not found" });
  });

  it("should create a comment successfully", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "post-1",
    } as any);

    const mockComment = {
      id: "comment-1",
      body: "Test comment",
      postId: "post-1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.comment.create).mockResolvedValue(mockComment as any);

    const result = await createComment({
      postId: "post-1",
      body: "Test comment",
    });

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        postId: "post-1",
        body: "Test comment",
        userId: "user-1",
      },
    });
    expect(result).toEqual(mockComment);
  });
});

describe("deleteComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await deleteComment("comment-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error if comment not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.comment.findUnique).mockResolvedValue(null);

    const result = await deleteComment("comment-1");
    expect(result).toEqual({ error: "Comment not found" });
  });

  it("should return error if user is not the owner", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.comment.findUnique).mockResolvedValue({
      id: "comment-1",
      userId: "user-2",
    } as any);

    const result = await deleteComment("comment-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should delete comment successfully", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.comment.findUnique).mockResolvedValue({
      id: "comment-1",
      userId: "user-1",
    } as any);

    vi.mocked(prisma.comment.delete).mockResolvedValue({
      id: "comment-1",
    } as any);

    const result = await deleteComment("comment-1");

    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: "comment-1" },
    });
    expect(result).toBe(true);
  });
});
