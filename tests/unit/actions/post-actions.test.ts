import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPost,
  deletePost,
  toggleLike,
  toggleStar,
} from "@/actions/post-actions";
import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/prismadb", () => ({
  db: {
    post: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("createPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    await expect(
      createPost({ title: "Test", body: "Body", tag: "test" }),
    ).rejects.toThrow("Unauthorized");
  });

  it("should create a post with valid data", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    const mockPost = {
      id: "post-1",
      title: "Test Title",
      body: "Test Body",
      tag: "discussion",
      userId: "user-1",
      likedIds: [],
      starIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.post.create).mockResolvedValue(mockPost as any);

    const result = await createPost({
      title: "Test Title",
      body: "Test Body",
      tag: "discussion",
    });

    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        title: "Test Title",
        body: "Test Body",
        tag: "discussion",
        likedIds: [],
        starIds: [],
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(result).toEqual(mockPost);
  });

  it("should throw on validation error for missing required fields", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    await expect(
      createPost({ title: undefined as any, body: undefined as any, tag: "" }),
    ).rejects.toThrow();
  });
});

describe("deletePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    await expect(deletePost("post-1")).rejects.toThrow("Unauthorized");
  });

  it("should throw on invalid ID", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    await expect(deletePost("")).rejects.toThrow("Invalid ID");
  });

  it("should throw if post not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

    await expect(deletePost("post-1")).rejects.toThrow("Post not found");
  });

  it("should throw if user is not the owner", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "post-1",
      userId: "user-2",
    } as any);

    await expect(deletePost("post-1")).rejects.toThrow("Unauthorized");
  });

  it("should delete post and return true", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "post-1",
      userId: "user-1",
    } as any);

    vi.mocked(prisma.post.delete).mockResolvedValue({ id: "post-1" } as any);

    const result = await deletePost("post-1");

    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: { id: "post-1" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(result).toBe(true);
  });
});

describe("toggleLike", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await toggleLike("post-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error for invalid ID", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    const result = await toggleLike("");
    expect(result).toEqual({ error: "Invalid ID" });
  });

  it("should return error if post not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

    const result = await toggleLike("post-1");
    expect(result).toEqual({ error: "Post not found" });
  });

  it("should like a post", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "post-1",
      likedIds: [],
    } as any);

    vi.mocked(prisma.post.update).mockResolvedValue({} as any);

    const result = await toggleLike("post-1");

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: {
        likedIds: { push: "user-1" },
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(result).toEqual({ hasLiked: true });
  });

  it("should unlike a post", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "post-1",
      likedIds: ["user-1"],
    } as any);

    vi.mocked(prisma.post.update).mockResolvedValue({} as any);

    const result = await toggleLike("post-1");

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: {
        likedIds: { set: [] },
      },
    });
    expect(result).toEqual({ hasLiked: false });
  });
});

describe("toggleStar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await toggleStar("post-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should return error for invalid ID", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    const result = await toggleStar("");
    expect(result).toEqual({ error: "Invalid ID" });
  });

  it("should return error if post not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

    const result = await toggleStar("post-1");
    expect(result).toEqual({ error: "Post not found" });
  });

  it("should star a post", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "post-1",
      starIds: [],
    } as any);

    vi.mocked(prisma.post.update).mockResolvedValue({} as any);

    const result = await toggleStar("post-1");

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: {
        starIds: { push: "user-1" },
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(result).toEqual({ hasStarred: true });
  });

  it("should unstar a post", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "post-1",
      starIds: ["user-1"],
    } as any);

    vi.mocked(prisma.post.update).mockResolvedValue({} as any);

    const result = await toggleStar("post-1");

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: {
        starIds: { set: [] },
      },
    });
    expect(result).toEqual({ hasStarred: false });
  });
});
