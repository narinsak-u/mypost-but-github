"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormData, PostPopulated } from "../types";

const useCreatePost = () => {
  // Get access to query client instance
  const queryClient = useQueryClient();

  const { mutateAsync: createPost, isPending } = useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axios.post(`/api/post`, { ...payload });
      return data as PostPopulated;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-query"] });
    },
  });

  return { createPost, isPending };
};

export default useCreatePost;
