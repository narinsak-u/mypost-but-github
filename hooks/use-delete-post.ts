"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeletePost = () => {
  // Get access to query client instance
  const queryClient = useQueryClient();

  const { mutateAsync: deletePost, isPending } = useMutation({
    mutationFn: async (postId: string) => {
      return await axios.delete(`/api/post/${postId}`);
    },
    onMutate: async (newData: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["posts-query", newData.id],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "posts-query",
        newData.id,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["posts-query", newData.id], newData);

      // Return a context with the previous and new todo
      return { previousData, newData };
    },

    // If the mutation fails, use the context we returned above
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        ["posts-query", context?.newData.id],
        context?.previousData
      );
    },

    onSuccess: (newData: any) => {
      // queryClient.invalidateQueries({ queryKey: ["posts-query", newData?.id] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.every((key) =>
            ["posts-query", "saved-posts"].includes(String(key))
          ),
      });
    },
  });

  return { deletePost, isPending };
};

export default useDeletePost;
