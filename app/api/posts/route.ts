import { db as prisma } from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  try {
    const limitParam = url.searchParams.get("limit");
    const pageParam = url.searchParams.get("page");

    const limit = limitParam ? parseInt(limitParam) : 10;
    const page = pageParam ? parseInt(pageParam) : 1;

    if (Number.isNaN(limit) || Number.isNaN(page)) {
      return new Response("Invalid pagination parameters", { status: 400 });
    }

    const posts = await prisma.post.findMany({
      take: limit,
      skip: (page - 1) * limit,
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

    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new NextResponse("Could not fetch posts", { status: 500 });
  }
}
