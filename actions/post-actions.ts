"use server";

import { db as prisma } from "@/lib/prismadb";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

import { PostValidator } from "@/types";
import { revalidatePath } from "next/cache";

// export type ResponseData = {
//   data: Post;
//   errors: {
//     status: number;
//     message: string;
//   };
// };

// create post
export const createPost = async (postData: {
  title: string;
  tag: string;
  body: string;
}) => {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { title, tag, body } = PostValidator.parse(postData);

    const post = await prisma.post.create({
      data: {
        userId,
        title,
        body,
        tag: tag ?? "",
        likedIds: [],
        starIds: [],
      },
    });

    revalidatePath("/");

    return post;
  } catch (error) {
    if (error instanceof z.ZodError) throw new Error(error.message);
    throw error;
  }
};

// delete post
export const deletePost = async (postId: string) => {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!postId || typeof postId !== "string") {
      throw new Error("Invalid ID");
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new Error("Post not found");


    // check if post belongs to user
    if (post.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");

    return true
  } catch (error) {
    if (error instanceof z.ZodError) throw new Error(error.message);
    throw error;
  }
}


export type ToggleLikeResult = { hasLiked: boolean } | { error: string };

// togglelike post
export const toggleLike = async (postId: string): Promise<ToggleLikeResult> => {
  const { userId } = await auth();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

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

// toggle star post
export const toggleStar = async (postId: string): Promise<ToggleStarResult> => {
  const { userId } = await auth();

  try {
    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (!postId || typeof postId !== "string") {
      return { error: "Invalid ID" };
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return { error: "Post not found" };

    const starIds = post.starIds ?? [];
    const currentlyStarred = starIds.includes(userId);
    const updatedStarIds = currentlyStarred
      ? starIds.filter((id) => id !== userId)
      : [...starIds, userId];

    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        starIds: updatedStarIds,
      },
    });

    revalidatePath("/");
    return { hasStarred: !currentlyStarred };
  } catch (error) {
    console.log(error);
    return { error: "Internal server error" };
  }
};
