"use server";

import { db as prisma } from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id ?? null;
}

export const markAsRead = async (conversationId: string) => {
  const userId = await getUserId();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (!conversationId) {
      return { error: "Conversation ID is required" };
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("MARK_AS_READ_ERROR", error);
    return { error: "Internal server error" };
  }
};
