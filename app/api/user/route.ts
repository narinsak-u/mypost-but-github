import { db as prisma } from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const users = await prisma.user.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return NextResponse.json({ data: users });
}
