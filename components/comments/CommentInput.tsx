"use client";

import { useCallback, useState } from "react";
import useCreateComment from "@/hooks/use-create-commnet";

import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { createComment } from "@/actions/comment-actions";
import { useValidateQuery } from "@/hooks/use-revalidate-query";
import { useRouter } from "next/navigation";
import { PostPopulated } from "@/types";

const CommentInput = ({ post }: { post: PostPopulated }) => {
  const [commentBody, setCommentBody] = useState<string>("");

  const { createComment, isPending } = useCreateComment(post);
  const { data: session, isPending: isLoaded } = useSession();

  if (!isLoaded) return null;

  // # Handle create comment
  const onCreateComment = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        await createComment({ body: commentBody });
        setCommentBody("");
      }
    },
    [createComment, setCommentBody, commentBody],
  );

  const disabledInput = isPending || !session?.user?.id;

  return (
    <div className="flex items-center justify-start my-3 mx-6 ">
      <div>
        <Avatar className="w-6.25 h-6.25">
          <AvatarImage
            src={`${session?.user?.image}` || "https://github.com/shadcn.png"}
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <Input
        aria-label="text"
        placeholder={!session?.user?.id ? `Sign in to comment` : "Type here..."}
        type="text"
        value={commentBody}
        onChange={(e) => setCommentBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          startTransition(() => {
            onCreateComment();
          });
        }}
        disabled={disabledInput}
        className="bg-transparent h-9 w-full rounded-sm ml-4 border border-[#444C56] focus:border-0"
      />
    </div>
  );
};

export default CommentInput;
