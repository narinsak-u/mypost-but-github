import { db as prisma } from "@/lib/prismadb";
import { CommentValidator } from "@/types";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;
  const { postId } = await params;

  try {
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
