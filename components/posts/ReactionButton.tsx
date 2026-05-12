"use client";

import { ReactionButtonType } from "./PostItem";
import { PostPopulated } from "@/types";

import useLike from "@/hooks/use-like-post";
import useSavePost from "@/hooks/use-save-post";

import { Bookmark, Heart, MessagesSquare } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Props = {
  selected: ReactionButtonType;
  setSelected: React.Dispatch<React.SetStateAction<ReactionButtonType>>;
  post: PostPopulated;
};

const ReactionButton = ({ selected, setSelected, post }: Props) => {
  const { hasLiked, toggleLike } = useLike({ post });
  const { hasSaved, toggleSave } = useSavePost({ post });

  return (
    <div className="mt-5 gap-3 flex">
      {/* LIKE */}
      <div className="flex items-center cursor-pointer bg-transparent hover:opacity-70">
        <SignedIn>
          <div onClick={toggleLike}>
            {hasLiked ? (
              <div className="flex gap-2 items-center">
                <Heart size={18} fill="#006EED" />
                <div className="font-semibold text-sm flex gap-1">
                  <p>Liked</p>
                  <div className="hidden md:block">
                    {post.likedIds.length === 0
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
                      {post.likedIds.length === 0
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
          <SignInButton mode="modal">
            <div className="flex gap-2 items-center">
              <Heart size={18} />
              <div className="font-semibold text-sm flex gap-1">
                <p>Like</p>
                <div className="hidden md:block">
                  {post.likedIds.length === 0
                    ? ""
                    : `· ${post.likedIds.length}`}
                </div>
              </div>
            </div>
          </SignInButton>
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
            {post.comments.length === 0 ? "" : `· ${post.comments.length}`}
          </div>
        </div>
      </div>

      {/* BOOKMARK */}
      <div className="flex gap-1 items-center hover:opacity-70 justify-center bg-transparent cursor-pointer">
        <SignedIn>
          <div onClick={toggleSave}>
            {hasSaved ? (
              <div className="text-sm font-semibold flex gap-1">
                <Bookmark size={18} fill="#006EED" />
                <p>Saved</p>
              </div>
            ) : (
              <div className="text-sm font-semibold flex gap-1">
                <Bookmark size={18} />
                <p>Save</p>
              </div>
            )}
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <div className="text-sm font-semibold flex gap-1">
              <Bookmark size={18} />
              <p>Save</p>
            </div>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
};

export default ReactionButton;
