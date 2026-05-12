import { db as prisma } from "@/lib/prismadb";

const getPopularPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      comments: true,
    },
    orderBy: [
      { likedIds: "desc" },
      // { saveIds: "desc" },
      {
        comments: {
          _count: "desc",
        },
      },
    ],
    take: 5,
  });

  return posts;
};

export default getPopularPosts;
