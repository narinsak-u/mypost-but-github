"use server";

import { db as prisma } from "@/lib/prismadb";

const getPostById = async (postId: string) => {
  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        user: true,
        comments: true,
      },
    });

    return post;
  } catch (error) {
    console.error("GET_POST_BY_ID_ERROR", error);
    return [];
  }
};

export default getPostById;
