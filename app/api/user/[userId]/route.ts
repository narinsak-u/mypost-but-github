import { db } from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });
  return NextResponse.json(user);
}
