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

export const createConversation = async (targetUserId: string) => {
  const userId = await getUserId();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (!targetUserId) {
      return { error: "Target user ID is required" };
    }

    if (userId === targetUserId) {
      return { error: "Cannot create conversation with yourself" };
    }

    // Check if conversation already exists between these two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [userId, targetUserId],
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    // Prisma will handle the many-to-many connection in User.conversationIds
    const conversation = await prisma.conversation.create({
      data: {
        participantIds: [userId, targetUserId],
        participants: {
          connect: [
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
            { id: targetUserId },
          ],
        },
      },
    });

    return conversation;
  } catch (error) {
    console.error("CREATE_CONVERSATION_ERROR", error);
    return { error: "Internal server error" };
  }
};
