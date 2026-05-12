"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentInput } from "@/types";
import { Post } from "@prisma/client";
import { queryKeys } from "./keys";

const useCreateComment = (post: Post) => {
  const queryClient = useQueryClient();

  const { mutateAsync: createComment, isPending } = useMutation({
    mutationFn: async (payload: CommentInput) => {
      return await axios.post(`/api/post/${post.id}/comment`, { ...payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.saved });
    },
  });

  return { createComment, isPending };
};

export default useCreateComment;
