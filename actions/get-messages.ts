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

export const getMessages = async (conversationId: string) => {
  const userId = await getUserId();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (!conversationId) {
      return { error: "Conversation ID is required" };
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return messages;
  } catch (error) {
    console.error("GET_MESSAGES_ERROR", error);
    return { error: "Internal server error" };
  }
};
