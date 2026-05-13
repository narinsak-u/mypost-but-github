"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Tag from "../Tag";
import ReactionButton from "./ReactionButton";
import CommentSection from "../comments/CommentSection";
import OptionMenu from "../OptionMenu";
import { PostPopulated } from "@/types";
import { useGetUser } from "@/hooks/use-get-user";
import { useParseContent } from "@/hooks/use-parse-content";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export type ReactionButtonType = {
  comment: boolean;
};

type Props = {
  post: PostPopulated;
  isPost?: boolean;
  isSuggestion?: boolean;
  className?: string;
};

const PostItem = ({
  post,
  isPost,
  isSuggestion,
  className,
}: Props) => {
  const [selected, setSelected] = useState<ReactionButtonType>({
    comment: Boolean(!isSuggestion && isPost),
  });
  const router = useRouter();
  const { data: user, isFetching } = useGetUser({ userId: post.userId });
  const postBody = useParseContent(post.body!);

  return (
    <div className={cn("flex flex-col h-fit mt-10", className)}>
      <div className="flex items-center justify-start mx-1 mb-4">
        {!isSuggestion && (
          <div className="flex justify-between w-full gap-1">
            <div className="flex items-center gap-2">
              <Link href={`/user/${user?.id}`}>
                <Avatar className="w-7.5 h-7.5">
                  <AvatarImage
                    src={`${user?.imageUrl}` || "https://github.com/shadcn.png"}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <div className="text-sm">
                  <Link className="hover:underline" href={`/user/${user?.id}`}>{`${user?.firstName} ${user?.lastName}`}</Link>
                  <span className="text-[#ADBAC7] px-1">posted</span>
                  <Link className="hover:underline" href={`/post/${post.id}`}>{post.title}</Link>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                </div>
              </div>

              {/* follow button */}
              {/* <div className="self-start text-sm text-muted-foreground">
                <button
                  className={cn(
                    "px-2 py-0.5 text-xs cursor-pointer text-[#8B949E] bg-[#161B22] border border-[#30363D] rounded-sm"
                  )}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div> */}
            </div>

            {/* author action */}
            <OptionMenu post={post} />

          </div>
        )}
      </div>
      <div className="rounded-sm w-full h-fit bg-[#30363E] border border-[#444C56]">
        <div
          className={cn(
            "flex flex-col",
            isSuggestion ? "h-22 px-4 py-2" : "mx-8 my-5"
          )}
        >
          <div
            className={"cursor-pointer"}
            onClick={() => router.push(`/post/${post.id}`)}
          >
            <div className="flex justify-between items-center">
              <div
                className={cn(
                  "text-sm font-semibold mb-0.5",
                  isSuggestion && "line-clamp-2"
                )}
              >
                {post.title}
              </div>
            </div>
            <div
              className={cn(
                isSuggestion && "text-xs text-[#ADBAC7] line-clamp-2 mt-2"
              )}
              dangerouslySetInnerHTML={{ __html: postBody! }}
            />
            {!isSuggestion && (
              <div className={"mt-7"}>
                <Tag text={post.tag ?? ""} />
              </div>
            )}
          </div>

          {!isSuggestion && (
            <ReactionButton
              selected={selected}
              setSelected={setSelected}
              post={post}
            />
          )}
        </div>
      </div>

      {selected && selected.comment && <CommentSection post={post} />}
    </div>
  );
};

export default PostItem;
