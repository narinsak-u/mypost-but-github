import { db as prisma } from "@/lib/prismadb";

const getPosts = async () => {
  try {
    const posts = await prisma.post.findMany({});

    return posts;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getPosts;
