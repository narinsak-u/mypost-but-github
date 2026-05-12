"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

type ChildrenProps = {
  children: React.ReactNode;
};

type AuthGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function SignedIn({ children }: ChildrenProps) {
  const { data: session, isPending } = useSession();

  if (isPending) return null;
  if (!session) return null;

  return <>{children}</>;
}

export function SignedOut({ children }: ChildrenProps) {
  const { data: session, isPending } = useSession();

  if (isPending) return null;
  if (session) return null;

  return <>{children}</>;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) return null;
  if (!session) return <>{fallback}</>;

  return <>{children}</>;
}
