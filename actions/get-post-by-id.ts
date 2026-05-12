import { db as prisma } from "@/lib/prismadb";

const getPostById = async (postId: string) => {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: true,
      },
    });

    return post;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getPostById;
