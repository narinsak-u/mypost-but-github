import { db as prisma } from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// save
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { postId } = params;

  if (!postId || typeof postId !== "string") {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return new NextResponse("Post not found", { status: 404 });

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        saveIds: {
          push: userId,
        },
      },
    });

    //   TODO: Notification here

    return NextResponse.json(updatedPost);
  } catch (error) {
    return new Response("Something went wrong. Please try later", {
      status: 500,
    });
  }
}

// unsave
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { postId } = params;

  if (!postId || typeof postId !== "string") {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return new NextResponse("Post not found", { status: 404 });

    let updatedLikedIds = [...(post.likedIds || [])];

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        saveIds: updatedLikedIds.filter((id) => id !== userId),
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return new Response("Something went wrong. Please try later", {
      status: 500,
    });
  }
}
