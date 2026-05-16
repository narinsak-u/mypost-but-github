import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toggleFollow, getIsFollowing } from "@/actions/follow-actions";
import { db } from "@/lib/prismadb";
import * as authModule from "@/lib/auth";
import { clearDatabase, seedTestUser } from "@/tests/fixtures/db";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

const mockSession = (userId: string | null = null) => {
  vi.spyOn(authModule.auth.api, "getSession").mockResolvedValue(
    userId ? ({ user: { id: userId } } as any) : null,
  );
};

describe("Integration: follow-actions", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabase();
  }, 30000);

  afterEach(async () => {
    await clearDatabase();
  }, 30000);

  describe("toggleFollow", () => {
    it("follows a user", async () => {
      const follower = await seedTestUser();
      const following = await seedTestUser();
      mockSession(follower.id);

      const result = await toggleFollow(following.id);

      expect(result).toEqual({ success: true, followed: true });

      const followRecord = await db.follower.findFirst({
        where: {
          followerId: follower.id,
          followingId: following.id,
        },
      });
      expect(followRecord).not.toBeNull();
    });

    it("unfollows a user", async () => {
      const follower = await seedTestUser();
      const following = await seedTestUser();
      mockSession(follower.id);

      await toggleFollow(following.id);

      const result = await toggleFollow(following.id);

      expect(result).toEqual({ success: true, followed: false });

      const followRecord = await db.follower.findFirst({
        where: {
          followerId: follower.id,
          followingId: following.id,
        },
      });
      expect(followRecord).toBeNull();
    });

    it("returns error when trying to follow self", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const result = await toggleFollow(user.id);

      expect(result).toEqual({ error: "You cannot follow yourself" });
    });
  });

  describe("getIsFollowing", () => {
    it("returns true after following", async () => {
      const follower = await seedTestUser();
      const following = await seedTestUser();
      mockSession(follower.id);

      await toggleFollow(following.id);

      const result = await getIsFollowing(following.id);

      expect(result).toEqual({ isFollowing: true });
    });

    it("returns false when not following", async () => {
      const follower = await seedTestUser();
      const following = await seedTestUser();
      mockSession(follower.id);

      const result = await getIsFollowing(following.id);

      expect(result).toEqual({ isFollowing: false });
    });

    it("returns false after unfollowing", async () => {
      const follower = await seedTestUser();
      const following = await seedTestUser();
      mockSession(follower.id);

      await toggleFollow(following.id);
      await toggleFollow(following.id);

      const result = await getIsFollowing(following.id);

      expect(result).toEqual({ isFollowing: false });
    });
  });
});
