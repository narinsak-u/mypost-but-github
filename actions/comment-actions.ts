"use server";

import { db as prisma } from "@/lib/prismadb";
import { CommentValidator } from "@/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id ?? null;
}

export const createComment = async (commentData: {
  postId: string;
  body: string;
}) => {
  const userId = await getUserId();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const { postId, body } = CommentValidator.parse(commentData);

    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!existingPost) {
      return { error: "Post not found" };
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        body,
        userId,
      },
    });

    return comment;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.message };
    }

    return { error: "Could not create comment. Please try later" };
  }
};

// delete comment
export const deleteComment = async (commentId: string) => {
  const userId = await getUserId();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const existingComment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!existingComment) {
      return { error: "Comment not found" };
    }

    if (existingComment.userId !== userId) {
      return { error: "Unauthorized" };
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return true;
  } catch (error) {
    return { error: "Could not delete comment. Please try later" };
  }
};
