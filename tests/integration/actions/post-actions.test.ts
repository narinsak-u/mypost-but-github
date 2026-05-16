import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createPost,
  deletePost,
  toggleLike,
  toggleStar,
} from "@/actions/post-actions";
import { db as prisma } from "@/lib/prismadb";
import * as authModule from "@/lib/auth";
import { clearDatabase, seedTestUser, seedTestPost } from "@/tests/fixtures/db";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

const mockSession = (userId: string | null = null) => {
  vi.spyOn(authModule.auth.api, "getSession").mockResolvedValue(
    userId ? ({ user: { id: userId } } as any) : null,
  );
};

describe("Integration: post-actions", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabase();
  }, 30000);

  afterEach(async () => {
    await clearDatabase();
  }, 30000);

  describe("createPost", () => {
    it("creates a post in the database", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const result = await createPost({
        title: "Integration Test Post",
        body: "This is the body of the integration test post.",
        tag: "integration",
      });

      expect(result).toHaveProperty("id");
      expect(result.title).toBe("Integration Test Post");
      expect(result.body).toBe(
        "This is the body of the integration test post.",
      );
      expect(result.tag).toBe("integration");
      expect(result.userId).toBe(user.id);

      const dbPost = await prisma.post.findUnique({
        where: { id: result.id },
      });
      expect(dbPost).not.toBeNull();
      expect(dbPost?.title).toBe("Integration Test Post");
    });

    it("throws if user is not authenticated", async () => {
      mockSession(null);

      await expect(
        createPost({
          title: "Test",
          body: "Body",
          tag: "test",
        }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("deletePost", () => {
    it("deletes a post owned by the user", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const post = await seedTestPost(user.id);

      const result = await deletePost(post.id);

      expect(result).toBe(true);

      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(deletedPost).toBeNull();
    });

    it("fails to delete a post not owned by the user", async () => {
      const owner = await seedTestUser();
      const otherUser = await seedTestUser();
      mockSession(otherUser.id);

      const post = await seedTestPost(owner.id);

      await expect(deletePost(post.id)).rejects.toThrow("Unauthorized");

      const stillExists = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });

  describe("toggleLike", () => {
    it("likes a post", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const post = await seedTestPost(user.id, { likedIds: [], starIds: [] });

      const result = await toggleLike(post.id);

      expect(result).toEqual({ hasLiked: true });

      const updatedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(updatedPost?.likedIds).toContain(user.id);
    });

    it("unlikes a post", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const post = await seedTestPost(user.id, {
        likedIds: [user.id],
        starIds: [],
      });

      const result = await toggleLike(post.id);

      expect(result).toEqual({ hasLiked: false });

      const updatedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(updatedPost?.likedIds).not.toContain(user.id);
    });
  });

  describe("toggleStar", () => {
    it("stars a post", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const post = await seedTestPost(user.id, { likedIds: [], starIds: [] });

      const result = await toggleStar(post.id);

      expect(result).toEqual({ hasStarred: true });

      const updatedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(updatedPost?.starIds).toContain(user.id);
    });

    it("unstars a post", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const post = await seedTestPost(user.id, {
        likedIds: [],
        starIds: [user.id],
      });

      const result = await toggleStar(post.id);

      expect(result).toEqual({ hasStarred: false });

      const updatedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(updatedPost?.starIds).not.toContain(user.id);
    });
  });
});
