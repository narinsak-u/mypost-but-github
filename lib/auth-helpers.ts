import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function getCurrentSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return new NextResponse(message, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return new NextResponse(message, { status: 403 });
}

export function notFoundResponse(message = "Not found") {
  return new NextResponse(message, { status: 404 });
}
