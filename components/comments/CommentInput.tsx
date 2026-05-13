"use client";

import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { createComment } from "@/actions/comment-actions";
import { useValidateQuery } from "@/hooks/use-revalidate-query";
import { useRouter } from "next/navigation";
import { PostPopulated } from "@/types";

const CommentInput = ({ post }: { post: PostPopulated }) => {
  const [commentBody, setCommentBody] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const { validatePostQueries } = useValidateQuery();

  const onCreateComment = async () => {
    if (isPending || !user?.id || !post.id || commentBody.trim() === "") return;

    try {
      const comment = await createComment({ postId: post.id, body: commentBody });

      if (!("error" in comment)) {
        setCommentBody("");
        await validatePostQueries({ ...post, comments: [...post.comments, comment] });
        router.refresh();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const disabledInput = isPending || !user?.id || !post.id;

  // Check if user is loaded
  if (!isLoaded) return null;

  return (
    <div className="flex items-center justify-start my-3 mx-6 ">
      <div>
        <Avatar className="w-6.25 h-6.25">
          <AvatarImage
            src={`${user?.imageUrl}` || "https://github.com/shadcn.png"}
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <Input
        aria-label="text"
        placeholder={
          isPending
            ? "Comment creating..."
            : user?.id === undefined
              ? "Sign in to comment"
              : "Type here..."
        }
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
