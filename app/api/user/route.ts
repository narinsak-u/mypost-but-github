import { db } from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}
