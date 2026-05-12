import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const client = await clerkClient();
  const { userId } = await params;
  const user = await client.users.getUser(userId);

  return NextResponse.json(user);
}
