import { db as prisma } from "@/lib/prismadb";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const url = new URL(request.url);
  const { userId } = params;

  // console.log("url", url);

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

    // let whereClause = {};

    const posts = await prisma.post.findMany({
      where: {
        userId,
      },
      take: parseInt(limit),
      // cursor: cursor,
      // cursor: cursor ? { id: cursor } : undefined,
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

    // revalidateTag("posts");
    revalidatePath("/");

    return NextResponse.json(posts ?? []);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new NextResponse("Could not fetch posts", { status: 500 });
  }
}
