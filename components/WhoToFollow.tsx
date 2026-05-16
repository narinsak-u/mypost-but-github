"use client";

import { authClient } from "@/lib/auth-client";
import { useGetUserList } from "@/hooks/use-get-user-list";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";

const WhoToFollow = () => {
  const { data: users } = useGetUserList();
  const { data: session } = authClient.useSession();

  const suggestions = (users ?? [])
    .filter((u: any) => (session?.user?.id ? u.id !== session.user.id : true))
    .slice(0, 3)
    .map((u: any) => ({
      id: u.id,
      name: u.name || "User",
      handle: `@${(u.name || "User").replace(/\s+/g, "")}`,
      imageUrl: u.image,
    }));

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recommended for you</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {suggestions.map((suggestion: any) => {
          return (
            <div
              key={suggestion.id}
              className="flex items-center justify-between gap-4 rounded-md bg-[#30363E] border border-[#444C56] px-4 py-3"
            >
              <Link
                href={`/user/${suggestion.id}`}
                className="flex min-w-0 items-center gap-3"
              >
                <UserAvatar
                  imageUrl={
                    suggestion.imageUrl || "https://github.com/shadcn.png"
                  }
                  name={suggestion.name}
                  size="lg"
                  className="size-10 shrink-0"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {suggestion.name}
                  </div>
                  <div className="truncate text-xs text-[#8B949E]">
                    {suggestion.handle}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};
export default WhoToFollow;
