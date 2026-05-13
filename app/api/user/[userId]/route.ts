import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return NextResponse.json(user);
}
