"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) return null;
  if (!session) return null;

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.slice(0, 2).toUpperCase() ?? "U");

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm font-medium text-white sm:block">
        {user.name ?? user.email}
      </span>
      <Avatar className="h-8 w-8">
        {user.image && (
          <AvatarImage src={user.image} alt={user.name ?? "User"} />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
