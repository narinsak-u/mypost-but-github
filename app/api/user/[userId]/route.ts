import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const client = await clerkClient();
  const user = await client.users.getUser(params.userId);

  return NextResponse.json(user);
}
