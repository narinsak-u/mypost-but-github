"use client";

import CommentItem from "./CommentItem";
import { PostPopulated } from "@/types";
import CommentInput from "./CommentInput";

type Props = {
  post: PostPopulated;
};

const CommentSection = ({ post }: Props) => {
  const comments = post?.comments ?? [];

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} post={post} />
      ))}
      <CommentInput post={post} />
    </div>
  );
};

export default CommentSection;
