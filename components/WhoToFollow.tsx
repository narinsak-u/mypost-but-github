'use client';

import { useUser } from "@clerk/nextjs";
import { useGetUserList } from "@/hooks/use-get-user-list";
import Link from "next/link";
// import { useState, useTransition } from "react";
// import { toggleFollow } from "@/actions/follow-actions";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

type ClerkUser = {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    imageUrl?: string | null;
    isFollowing?: boolean;
};

const WhoToFollow = () => {
    // const router = useRouter();
    // const [isPending, startTransition] = useTransition();
    // const [followById, setFollowById] = useState<Record<string, boolean>>({});
    const { data: users } = useGetUserList();
    const { user, isLoaded } = useUser();

    const suggestions = ((users ?? []) as ClerkUser[])
        .filter((u) => (user?.id ? u.id !== user.id : true))
        .slice(0, 3)
        .map((u) => {
            return {
                id: u.id,
                name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username || "User",
                handle: `@${u?.firstName ?? ""}${u?.lastName ?? ""}`.trim(),
                imageUrl: u.imageUrl || "",
                isFollowing: Boolean(u.isFollowing),
            };
        });

    // const handleFollow = async (userId: string) => {
    //     startTransition(async () => {
    //         const { error, followed } = await toggleFollow(userId);

    //         if (!error && followed !== undefined) {
    //             setFollowById((prev) => ({ ...prev, [userId]: followed }));
    //             router.refresh();
    //         } else {
    //             toast.error(error);
    //         }
    //     });
    // };

    if (!isLoaded) return null;

    return (
        <section className="mt-12">
            <div className="flex items-center justify-between">
                <h2 className="text-md font-semibold">Recommended for you</h2>
                <button
                    type="button"
                    className="text-sm font-medium text-[#58A6FF] hover:underline"
                >
                    View all
                </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {suggestions.map((suggestion) => {
                    // const isFollowing =
                    //     followById[suggestion.id] ?? suggestion.isFollowing;

                    return (
                        <div
                            key={suggestion.id}
                            className="flex items-center justify-between gap-4 rounded-md bg-[#30363E] border border-[#444C56] px-4 py-3"
                        >
                            <Link href={`/user/${suggestion.id}`} className="flex min-w-0 items-center gap-3">
                                <img
                                    className="h-10 w-10 shrink-0 rounded-full"
                                    src={suggestion.imageUrl}
                                    alt={suggestion.name}
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

                            {/* <button
                                type="button"
                                className="h-8 shrink-0 rounded-md border border-[#8B949E] bg-[#161B22] px-3 text-sm font-semibold text-[#8B949E] hover:bg-[#262D34] cursor-pointer"
                                disabled={isPending}
                                onClick={() => handleFollow(suggestion.id)}
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button> */}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
export default WhoToFollow;
