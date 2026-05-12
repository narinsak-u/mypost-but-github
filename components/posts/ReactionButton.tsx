"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ReactionButtonType } from "./PostItem";
import { PostPopulated } from "@/types";

import { toggleLike, toggleStar } from "@/actions/post-actions";
import { useValidateQuery } from "@/hooks/use-revalidate-query";
import { toast } from "sonner";

import { Bookmark, Heart, MessagesSquare, Star } from "lucide-react";
import { SignedIn, SignedOut } from "../auth/SessionGuard";
import Link from "next/link";

type Props = {
  selected: ReactionButtonType;
  setSelected: React.Dispatch<React.SetStateAction<ReactionButtonType>>;
  post: PostPopulated;
};

const ReactionButton = ({ selected, setSelected, post }: Props) => {
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [hasStarred, setHasStarred] = useState<boolean>(false);
  const { data: session, isPending: isLoaded } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const { validatePostQueries } = useValidateQuery();
  const [isPending, startTransition] = useTransition();

  // Like post
  const handleLike = async () => {
    if (!userId || isPending) return;

    const res = await toggleLike(post.id);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }

    const updatedLikedIds = res.hasLiked
      ? Array.from(new Set([...(post.likedIds ?? []), userId]))
      : (post.likedIds ?? []).filter((id) => id !== userId);

    const updatedPost = { ...post, likedIds: updatedLikedIds };

    setHasLiked(res.hasLiked);
    await validatePostQueries(updatedPost);
    router.refresh();
  };

  // Star post
  const handleStar = async () => {
    if (!userId || isPending) return;

    const res = await toggleStar(post.id);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }

    const updatedStarIds = res.hasStarred
      ? Array.from(new Set([...(post.saveIds ?? []), userId]))
      : (post.saveIds ?? []).filter((id) => id !== userId);

    const updatedPost = { ...post, saveIds: updatedStarIds };

    setHasStarred(res.hasStarred);
    await validatePostQueries(updatedPost);
    router.refresh();
  };

  useEffect(() => {
    if (!userId) return;
    setHasLiked((post.likedIds ?? []).includes(userId));
    setHasStarred((post.saveIds ?? []).includes(userId));
  }, [post.likedIds, post.saveIds, userId]);

  if (!isLoaded) return null;

  return (
    <div className="mt-5 gap-3 flex">
      {/* LIKE */}
      <div className="flex items-center cursor-pointer bg-transparent hover:opacity-70">
        <SignedIn>
          <div onClick={() => startTransition(handleLike)}>
            {hasLiked ? (
              <div className="flex gap-2 items-center">
                <Heart size={18} fill="#006EED" />
                <div className="font-semibold text-sm flex gap-1">
                  <p>Liked</p>
                  <div className="hidden md:block">
                    {post?.likedIds?.length === 0
                      ? ""
                      : `· ${post.likedIds.length}`}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 items-center">
                  <Heart size={18} />
                  <div className="font-semibold text-sm flex gap-1">
                    <p>Like</p>
                    <div className="hidden md:block">
                      {post?.likedIds?.length === 0
                        ? ""
                        : `· ${post.likedIds.length}`}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </SignedIn>

        <SignedOut>
          <Link href="/sign-in">
            <div className="flex gap-2 items-center">
              <Heart size={18} />
              <div className="font-semibold text-sm flex gap-1">
                <p>Like</p>
                <div className="hidden md:block">
                  {post?.likedIds?.length === 0
                    ? ""
                    : `· ${post.likedIds.length}`}
                </div>
              </div>
            </div>
          </Link>
        </SignedOut>
      </div>

      {/* COMMENT */}
      <div
        className="flex items-center gap-1 bg-transparent cursor-pointer hover:opacity-70 border-none"
        onClick={() => setSelected({ ...selected, comment: !selected.comment })}
      >
        {selected && selected.comment ? (
          <MessagesSquare size={18} fill="#006EED" />
        ) : (
          <MessagesSquare size={18} />
        )}
        <div className="text-sm font-semibold flex gap-1">
          <p>Comment</p>
          <div className="hidden md:block">
            {post?.comments && post?.comments?.length === 0
              ? ""
              : `· ${post?.comments?.length}`}
          </div>
        </div>
      </div>

      {/* STAR */}
      <div className="flex gap-1 items-center hover:opacity-70 justify-center bg-transparent cursor-pointer">
        <SignedIn>
          <div onClick={() => startTransition(handleStar)}>
            {hasStarred ? (
              <div className="text-sm font-semibold flex gap-1 items-center">
                <Star size={18} fill="#006EED" />
                <p>Starred</p>
                <div className="hidden md:block">
                  {post?.saveIds?.length === 0
                    ? ""
                    : `· ${post.saveIds.length}`}
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold flex gap-1 items-center">
                <Star size={18} />
                <p>Star</p>
                <div className="hidden md:block">
                  {post?.saveIds?.length === 0
                    ? ""
                    : `· ${post.saveIds.length}`}
                </div>
              </div>
            )}
          </div>
        </SignedIn>

        <SignedOut>
          <Link href="/sign-in">
            <div className="text-sm font-semibold flex gap-1">
              <Bookmark size={18} />
              <p>Save</p>
            </div>
          </Link>
        </SignedOut>
      </div>
    </div>
  );
};

export default ReactionButton;
