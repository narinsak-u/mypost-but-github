"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentInput } from "@/types";
import { Post } from "@prisma/client";
import { queryKeys } from "@/lib/query-keys";

const useCreateComment = (post: Post) => {
  const queryClient = useQueryClient();

  const { mutateAsync: createComment, isPending } = useMutation({
    mutationFn: async (payload: CommentInput) => {
      const response = await axios.post(
        `/api/post/${post.id}/comment`,
        payload,
      );
      return response.data;
    },
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.comments.byPost(post.id),
      });

      const previousComments = queryClient.getQueryData(
        queryKeys.comments.byPost(post.id),
      );

      const optimisticComment = {
        id: `temp-${Date.now()}`,
        body: newComment.body,
        createdAt: new Date().toISOString(),
        postId: post.id,
      };

      queryClient.setQueryData(
        queryKeys.comments.byPost(post.id),
        (old: unknown[]) => [...(old || []), optimisticComment],
      );

      return { previousComments };
    },
    onError: (_err, _newComment, context) => {
      queryClient.setQueryData(
        queryKeys.comments.byPost(post.id),
        context?.previousComments,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byPost(post.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.infinite(),
      });
    },
  });

  return { createComment, isPending };
};

export default useCreateComment;
