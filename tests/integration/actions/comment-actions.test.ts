import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createComment, deleteComment } from "@/actions/comment-actions";
import { db as prisma } from "@/lib/prismadb";
import * as authModule from "@/lib/auth";
import {
  clearDatabase,
  seedTestUser,
  seedTestPost,
  seedTestComment,
} from "@/tests/fixtures/db";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

const mockSession = (userId: string | null = null) => {
  vi.spyOn(authModule.auth.api, "getSession").mockResolvedValue(
    userId ? ({ user: { id: userId } } as any) : null,
  );
};

describe("Integration: comment-actions", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabase();
  }, 30000);

  describe("createComment", () => {
    it("creates a comment in the database", async () => {
      const user = await seedTestUser();
      const post = await seedTestPost(user.id);
      mockSession(user.id);

      const result = await createComment({
        postId: post.id,
        body: "This is a test comment",
      });

      expect(result).toHaveProperty("id");
      expect((result as any).body).toBe("This is a test comment");
      expect((result as any).postId).toBe(post.id);
      expect((result as any).userId).toBe(user.id);

      const dbComment = await prisma.comment.findUnique({
        where: { id: (result as any).id },
      });
      expect(dbComment).not.toBeNull();
      expect(dbComment?.body).toBe("This is a test comment");
    });

    it("fails for a non-existent post", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const result = await createComment({
        postId: "000000000000000000000000",
        body: "This comment should fail",
      });

      expect(result).toEqual({ error: "Post not found" });
    });
  });

  describe("deleteComment", () => {
    it("deletes a comment owned by the user", async () => {
      const user = await seedTestUser();
      const post = await seedTestPost(user.id);
      mockSession(user.id);

      const comment = await seedTestComment(user.id, post.id);

      const result = await deleteComment(comment.id);

      expect(result).toBe(true);

      const deletedComment = await prisma.comment.findUnique({
        where: { id: comment.id },
      });
      expect(deletedComment).toBeNull();
    });

    it("fails to delete a comment not owned by the user", async () => {
      const owner = await seedTestUser();
      const otherUser = await seedTestUser();
      const post = await seedTestPost(owner.id);
      mockSession(otherUser.id);

      const comment = await seedTestComment(owner.id, post.id);

      const result = await deleteComment(comment.id);

      expect(result).toEqual({ error: "Unauthorized" });

      const stillExists = await prisma.comment.findUnique({
        where: { id: comment.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });
});
