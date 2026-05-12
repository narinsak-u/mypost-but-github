import { db as prisma } from "@/lib/prismadb";
import { CommentValidator } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { userId } = await auth();
  const { postId } = params;

  try {
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const commentBody = await request.json();
    const { body } = CommentValidator.parse(commentBody);

    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!existingPost) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        body,
        userId,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Could not create comment. Please try later", {
      status: 500,
    });
  }
}
