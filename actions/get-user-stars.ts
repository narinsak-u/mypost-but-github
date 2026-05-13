'use server'

import { db as prisma } from "@/lib/prismadb";

const getUserStars = async (userId: string) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        userId,
      },
      select: {
        starIds: true,
      }
    });

    // get all starIds from user posts
    const starCount = posts.reduce((sum, p) => sum + (p.starIds?.length ?? 0), 0);

    return { starCount };
  } catch (error) {
    console.log(error);
    return { starCount: 0 };
  }
};

export default getUserStars;
