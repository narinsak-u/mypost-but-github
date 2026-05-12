'use client'

import { Calendar, Mail, Star, UserPlus, Users2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleFollow } from "@/actions/follow-actions";
import { UserProfileUser } from "@/types";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Props = {
    isOwner: boolean;
    user: UserProfileUser;
    starCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
};

export const ProfileBanner = ({
    isOwner,
    user,
    starCount,
    followersCount,
    followingCount,
    isFollowing,
}: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [hasFollowed, setHasFollowed] = useState(isFollowing);

    const handleFollow = async () => {
        const { error, followed, success } = await toggleFollow(user.id);
        if (!error && followed !== undefined) {
            setHasFollowed(followed);
            router.refresh();
        } else {
            toast.error(error);
        }
    };

    const displayName =
        `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
        user?.username ||
        "User";

    const initials =
        `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.trim() ||
        (user?.username?.[0] ? user.username[0].toUpperCase() : "U");

    const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
    });

    return (
        <div className="mb-6 overflow-hidden rounded-lg border border-[#30363D] bg-linear-to-b from-[#161B22] to-[#0D1117]">
            <div className="p-4 sm:p-8">
                <div className="flex items-center gap-5 w-full flex-col sm:flex-row">
                    {/* avatar */}
                    <Avatar className="h-32 w-32 border-4 border-[#0D1117] shadow-sm">
                        <AvatarImage src={user?.imageUrl || "https://github.com/shadcn.png"} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    {/* metadata */}
                    <div className="flex items-center justify-center sm:justify-between sm:pr-8 gap-4 flex-col sm:flex-row pb-4 w-full">
                        <div className="flex flex-col">
                            <div className="truncate text-3xl font-bold text-white">{displayName}</div>
                            <div className="truncate text-sm text-[#8B949E]">{`@${user?.firstName ?? ""}${user?.lastName ?? ""}`.trim()}</div>
                            <div className="mt-4 text-sm">
                                <p className="text-[#8B949E]">No bio yet.</p>
                            </div>

                            {/* stats */}
                            <div className="mt-4 flex flex-col gap-2 text-sm text-[#8B949E]">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users2 size={16} />
                                        <span className="font-semibold text-[#C9D1D9]">{followersCount ?? 0}</span>
                                        <span>Followers</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserPlus size={16} />
                                        <span className="font-semibold text-[#C9D1D9]">{followingCount ?? 0}</span>
                                        <span>Following</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star size={16} />
                                        <span className="font-semibold text-[#C9D1D9]">{starCount}</span>
                                        <span>Stars</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span className="text-[#C9D1D9]">Joined {joined}</span>
                                </div>
                            </div>
                        </div>

                        {/* action */}
                        {!isOwner && (
                            <div className="flex gap-3 flex-row sm:flex-col self-start mt-2">
                                <SignedIn>
                                    <button
                                        disabled={isPending}
                                        onClick={() =>
                                            startTransition(handleFollow)
                                        }
                                        type="button"
                                        className="h-9 sm:px-6 px-4 rounded-md cursor-pointer bg-green-600 hover:bg-green-500 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] flex items-center gap-2"
                                    >
                                        <UserPlus size={16} />
                                        {hasFollowed ? "Unfollow" : "Follow"}
                                    </button>
                                </SignedIn>
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button
                                            disabled={isPending}
                                            onClick={() => { }}
                                            type="button"
                                            className="h-9 sm:px-6 px-4 rounded-md cursor-pointer bg-green-600 hover:bg-green-500 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] flex items-center gap-2"
                                        >
                                            <UserPlus size={16} />
                                            Follow
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                                <a
                                    href={user.email ? `mailto:${user.email}` : undefined}
                                    className="h-9 sm:px-6 px-4 rounded-md cursor-pointer border border-[#30363D] bg-[#161B22] text-sm font-semibold text-[#C9D1D9] hover:bg-[#262D34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1117] flex items-center gap-2"
                                >
                                    <Mail size={16} />
                                    Message
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ProfileBanner
