import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendMessage } from "@/actions/send-message";
import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/prismadb", () => ({
  db: {
    message: {
      create: vi.fn(),
    },
    conversation: {
      update: vi.fn(),
      findFirst: vi.fn(),
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

describe("sendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized if no user session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await sendMessage("conv-1", "hello");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("should create a message and update conversation", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.conversation.findFirst).mockResolvedValue({
      id: "conv-1",
    } as any);

    const mockMessage = {
      id: "msg-1",
      content: "hello",
      conversationId: "conv-1",
      senderId: "user-1",
    };
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as any);

    const result = await sendMessage("conv-1", "hello");

    expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
      where: {
        id: "conv-1",
        participantIds: {
          has: "user-1",
        },
      },
    });

    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        content: "hello",
        conversationId: "conv-1",
        senderId: "user-1",
      },
    });
    expect(prisma.conversation.update).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(result).toEqual(mockMessage);
  });

  it("should return unauthorized if user is not a participant", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    vi.mocked(prisma.conversation.findFirst).mockResolvedValue(null);

    const result = await sendMessage("conv-1", "hello");
    expect(result).toEqual({ error: "Unauthorized or conversation not found" });
  });

  it("should return error for missing fields", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    const result = await sendMessage("", "");
    expect(result).toEqual({ error: "Missing required fields" });
  });
});
