"use client";

import CommentItem from "./CommentItem";
import { Post } from "@prisma/client";

import { PostPopulated } from "@/types";
import CommentInput from "./CommentInput";

type Props = {
  post: PostPopulated;
};

const CommentSection = ({ post }: Props) => {
  return (
    <>
      <div>
        {post &&
          post.comments &&
          post.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
      </div>

      <CommentInput post={post} />
    </>
  );
};

export default CommentSection;
