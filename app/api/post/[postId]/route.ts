import { db as prisma } from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { userId } = await auth();

  try {
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId } = params;

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

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response("Could not create post. Please try later", {
      status: 500,
    });
  }
}
