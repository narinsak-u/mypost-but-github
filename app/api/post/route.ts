import { db as prisma } from "@/lib/prismadb";
import { PostValidator } from "@/types";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  try {
    const reqBody = await request.json();

    const { title, tag, body } = PostValidator.parse(reqBody);

    const post = await prisma.post.create({
      data: {
        userId,
        title,
        body,
        tag: tag ?? "",
      },
    });

    // revalidateTag("posts");
    revalidatePath("/");

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
