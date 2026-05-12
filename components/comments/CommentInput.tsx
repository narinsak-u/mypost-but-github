"use client";

import { useCallback, useState } from "react";
import useCreateComment from "@/hooks/use-create-commnet";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import { Post } from "@prisma/client";

type Props = {
  post: Post;
};

const CommentInput = ({ post }: Props) => {
  const [commentBody, setCommentBody] = useState<string>("");

  const { createComment, isPending } = useCreateComment(post);
  const { user, isLoaded } = useUser();

  // Check if user is loaded
  if (!isLoaded) return { isLoading: true };

  // # Handle create comment
  const onCreateComment = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        await createComment({ body: commentBody });
        setCommentBody("");
      }
    },
    [createComment, setCommentBody, commentBody]
  );

  const disabledInput = isPending || !user?.id;

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
          user?.id === undefined ? `Sign in to comment` : "Type here..."
        }
        type="text"
        value={commentBody}
        onChange={(e) => setCommentBody(e.target.value)}
        onKeyUp={(e) => {
          onCreateComment(e);
        }}
        disabled={disabledInput}
        className="bg-transparent h-9 w-full rounded-sm ml-4 border border-[#444C56] focus:border-0"
      />
    </div>
  );
};

export default CommentInput;
