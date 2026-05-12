import { db as prisma } from "@/lib/prismadb";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  try {
    const { postId } = await params;

    if (!postId || typeof postId !== "string") {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return new NextResponse("Post not found", { status: 404 });

    const deletedPost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    // revalidateTag("posts");
    revalidatePath("/");

    return NextResponse.json(deletedPost);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Could not create post. Please try later", {
      status: 500,
    });
  }
}
