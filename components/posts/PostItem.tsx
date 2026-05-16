"use client";

import { useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { UserAvatar } from "@/components/ui/user-avatar";
import Tag from "../Tag";
import ReactionButton from "./ReactionButton";
import CommentSection from "../comments/CommentSection";
import OptionMenu from "../OptionMenu";
import { PostPopulated } from "@/types";
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

const PostItem = ({ post, isPost, isSuggestion, className }: Props) => {
  const [selected, setSelected] = useState<ReactionButtonType>({
    comment: Boolean(!isSuggestion && isPost),
  });
  const { push } = useRouter();
  const user = isSuggestion ? null : post.user;
  const rawBody = useParseContent(post.body!);
  const sanitizedBody = useMemo(
    () => (rawBody ? DOMPurify.sanitize(rawBody) : ""),
    [rawBody],
  );

  return (
    <div className={cn("flex flex-col h-fit mt-10", className)}>
      <div className="flex items-center justify-start mx-1 mb-4">
        {!isSuggestion && (
          <div className="flex justify-between w-full gap-1">
            <div className="flex items-center gap-2">
              <Link href={`/user/${user?.id}`}>
                <UserAvatar
                  imageUrl={user?.image ?? "https://github.com/shadcn.png"}
                  name={user?.name ?? ""}
                  size="md"
                  className="size-7.5"
                />
              </Link>
              <div className="flex flex-col">
                <div className="text-sm">
                  <Link className="hover:underline" href={`/user/${user?.id}`}>
                    {user?.name ?? ""}
                  </Link>
                  <span className="text-[#ADBAC7] px-1">posted</span>
                  <Link className="hover:underline" href={`/post/${post.id}`}>
                    {post.title}
                  </Link>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span suppressHydrationWarning>
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </span>
                </div>
              </div>
            </div>

            <OptionMenu post={post} />
          </div>
        )}
      </div>
      <div className="rounded-sm w-full h-fit bg-[#30363E] border border-[#444C56]">
        <div
          className={cn(
            "flex flex-col",
            isSuggestion ? "h-22 px-4 py-2" : "mx-8 my-5",
          )}
        >
          <div
            role="button"
            tabIndex={0}
            className={"cursor-pointer"}
            onClick={() => push(`/post/${post.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                push(`/post/${post.id}`);
              }
            }}
          >
            <div className="flex justify-between items-center">
              <div
                className={cn(
                  "text-sm font-semibold mb-0.5",
                  isSuggestion && "line-clamp-2",
                )}
              >
                {post.title}
              </div>
            </div>
            {/* Sanitized via DOMPurify above - safe to render */}
            <div
              className={cn(
                isSuggestion && "text-xs text-[#ADBAC7] line-clamp-2 mt-2",
              )}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
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
