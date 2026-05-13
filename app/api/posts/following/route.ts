import { db as prisma } from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { limit, page } = z
      .object({
        limit: z.string(),
        page: z.string(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    const following = await prisma.follower.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json([]);
    }

    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: followingIds,
        },
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        comments: {
          include: {
            post: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/");

    return NextResponse.json(posts ?? []);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new NextResponse("Could not fetch posts", { status: 500 });
  }
}

