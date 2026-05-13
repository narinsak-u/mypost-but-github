import { db as prisma } from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  try {
    const limit = url.searchParams.get("limit");
    const page = url.searchParams.get("page");

    let posts;

    if (!limit || !page) {
      posts = await prisma.post.findMany({
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
    }

    if (limit && page) {
      posts = await prisma.post.findMany({
        take: parseInt(limit),
        // cursor: cursor,
        // cursor: cursor ? { id: cursor } : undefined,
        skip: (parseInt(page) - 1) * parseInt(limit!),
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
    }

    revalidatePath("/");

    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new NextResponse("Could not fetch posts", { status: 500 });
  }
}
