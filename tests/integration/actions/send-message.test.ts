import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendMessage } from "@/actions/send-message";
import { db as prisma } from "@/lib/prismadb";
import * as authModule from "@/lib/auth";
import {
  clearDatabase,
  seedTestUser,
  seedTestConversation,
} from "@/tests/fixtures/db";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

const mockSession = (userId: string | null = null) => {
  vi.spyOn(authModule.auth.api, "getSession").mockResolvedValue(
    userId ? ({ user: { id: userId } } as any) : null,
  );
};

describe("Integration: send-message", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearDatabase();
  }, 30000);

  afterEach(async () => {
    await clearDatabase();
  }, 30000);

  describe("sendMessage", () => {
    it("sends a message successfully", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      mockSession(user1.id);

      const conversation = await seedTestConversation([user1.id, user2.id]);

      const result = await sendMessage(conversation.id, "Hello, world!");

      expect(result).toHaveProperty("id");
      expect((result as any).content).toBe("Hello, world!");
      expect((result as any).conversationId).toBe(conversation.id);
      expect((result as any).senderId).toBe(user1.id);

      const dbMessage = await prisma.message.findUnique({
        where: { id: (result as any).id },
      });
      expect(dbMessage).not.toBeNull();
      expect(dbMessage?.content).toBe("Hello, world!");
    });

    it("fails for a non-participant", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      const nonParticipant = await seedTestUser();
      mockSession(nonParticipant.id);

      const conversation = await seedTestConversation([user1.id, user2.id]);

      const result = await sendMessage(conversation.id, "I shouldn't be here");

      expect(result).toEqual({
        error: "Unauthorized or conversation not found",
      });
    });

    it("fails for missing conversationId", async () => {
      const user = await seedTestUser();
      mockSession(user.id);

      const result = await sendMessage("", "Hello");

      expect(result).toEqual({ error: "Missing required fields" });
    });

    it("fails for missing content", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      mockSession(user1.id);

      const conversation = await seedTestConversation([user1.id, user2.id]);

      const result = await sendMessage(conversation.id, "");

      expect(result).toEqual({ error: "Missing required fields" });
    });

    it("updates the conversation lastMessageAt", async () => {
      const user1 = await seedTestUser();
      const user2 = await seedTestUser();
      mockSession(user1.id);

      const conversation = await seedTestConversation([user1.id, user2.id]);
      const originalLastMessageAt = conversation.lastMessageAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await sendMessage(conversation.id, "New message");

      const updatedConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
      });
      expect(
        updatedConversation?.lastMessageAt.getTime(),
      ).toBeGreaterThanOrEqual(originalLastMessageAt.getTime());
    });
  });
});
