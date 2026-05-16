"use server";

import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id ?? null;
}

export const sendMessage = async (conversationId: string, content: string) => {
  const userId = await getUserId();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (!conversationId || !content) {
      return { error: "Missing required fields" };
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: {
          has: userId,
        },
      },
    });

    if (!conversation) {
      return { error: "Unauthorized or conversation not found" };
    }

    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: userId,
      },
    });

    // Update lastMessageAt in Conversation
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
      },
    });

    revalidatePath("/");

    return message;
  } catch (error) {
    console.error("SEND_MESSAGE_ERROR", error);
    return { error: "Internal server error" };
  }
};
