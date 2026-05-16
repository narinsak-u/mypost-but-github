"use client";

import CommentItem from "./CommentItem";
import { PostPopulated } from "@/types";
import CommentInput from "./CommentInput";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Props = {
  post: PostPopulated;
};

const CommentSection = ({ post }: Props) => {
  const queryClient = useQueryClient();
  const [, setTick] = useState(0);

  useEffect(() => {
    const cache = queryClient.getQueryCache();
    const unsubscribe = cache.subscribe((event) => {
      if (event.type === "updated" && event.query.queryKey[0] === "posts") {
        setTick((t) => t + 1);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const comments = (() => {
    const cached = queryClient.getQueriesData({
      predicate: (query) => query.queryKey[0] === "posts",
    });
    for (const [, data] of cached) {
      if (!data || typeof data !== "object" || !("pages" in data)) continue;
      const pages = (data as any).pages;
      if (!Array.isArray(pages)) continue;
      for (const page of pages) {
        if (!Array.isArray(page)) continue;
        const found = page.find((p: any) => p?.id === post.id);
        if (found?.comments) return found.comments;
      }
    }
    return post?.comments ?? [];
  })();

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
