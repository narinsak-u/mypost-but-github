"use server";

import { db as prisma } from "@/lib/prismadb";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth-helpers";

import { PostValidator } from "@/types";
import { revalidatePath } from "next/cache";

// export type ResponseData = {
//   data: Post;
//   errors: {
//     status: number;
//     message: string;
//   };
// };

export const createPost = async (postData: {
  title: string;
  tag: string;
  body: string;
}) => {
  const session = await getCurrentSession();

  try {
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;
    const { title, tag, body } = PostValidator.parse(postData);

    const post = await prisma.post.create({
      data: {
        userId,
        title,
        body,
        tag: tag ?? "",
        likedIds: [],
        saveIds: [],
      },
    });

    revalidatePath("/");

    return post;
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.message };
    return { error: "Internal server error" };
  }
};

export const deletePost = async (postId: string) => {
  const session = await getCurrentSession();

  try {
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    if (!postId || typeof postId !== "string") {
      return { error: "Invalid ID" };
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return { error: "Post not found" };

    if (post.userId !== userId) {
      return { error: "Unauthorized" };
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");

    return true;
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.message };
    return { error: "Internal server error" };
  }
};

export type ToggleLikeResult = { hasLiked: boolean } | { error: string };

export const toggleLike = async (postId: string): Promise<ToggleLikeResult> => {
  const session = await getCurrentSession();

  try {
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    if (!postId || typeof postId !== "string") {
      return { error: "Invalid ID" };
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return { error: "Post not found" };

    const likedIds = post.likedIds ?? [];
    const currentlyLiked = likedIds.includes(userId);

    const updatedLikedIds = currentlyLiked
      ? likedIds.filter((id) => id !== userId)
      : [...likedIds, userId];

    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        likedIds: updatedLikedIds,
      },
    });

    revalidatePath("/");
    return { hasLiked: !currentlyLiked };
  } catch (error) {
    console.log(error);
    return { error: "Internal server error" };
  }
};

export type ToggleStarResult = { hasStarred: boolean } | { error: string };

export const toggleStar = async (postId: string): Promise<ToggleStarResult> => {
  const session = await getCurrentSession();

  try {
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    if (!postId || typeof postId !== "string") {
      return { error: "Invalid ID" };
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return { error: "Post not found" };

    const starIds = post.saveIds ?? [];
    const currentlyStarred = starIds.includes(userId);
    const updatedStarIds = currentlyStarred
      ? starIds.filter((id) => id !== userId)
      : [...starIds, userId];

    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        saveIds: updatedStarIds,
      },
    });

    revalidatePath("/");
    return { hasStarred: !currentlyStarred };
  } catch (error) {
    console.log(error);
    return { error: "Internal server error" };
  }
};
