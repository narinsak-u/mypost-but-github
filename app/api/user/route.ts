import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const client = await clerkClient();
  const users = await client.users.getUserList();

  return NextResponse.json(users);
}
