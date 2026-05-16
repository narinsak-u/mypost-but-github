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

export const getConversations = async () => {
  const userId = await getUserId();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return conversations;
  } catch (error) {
    console.error("GET_CONVERSATIONS_ERROR", error);
    return { error: "Internal server error" };
  }
};
