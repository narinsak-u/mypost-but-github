"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
// import { like, unlike } from "@/actions/serverActions";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostPopulated } from "@/types";
import { useUser } from "@clerk/nextjs";

type Props = {
  post: PostPopulated;
};

const useSavePost = ({ post }: Props) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Get access to query client instance
  const queryClient = useQueryClient();

  // Check if user is loaded
  if (!isLoaded) return { isLoading: true };

  // save
  const { mutate: saveMutation } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/post/${post.id}/save`);
    },
    onMutate: async (newData: PostPopulated) => {
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

    // Always refetch after error or success:
    onSuccess: (newData: any) => {
      // queryClient.invalidateQueries({ queryKey: ["posts-query", newData?.id] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.every((key) =>
            ["posts-query", "saved-posts", "saved-count"].includes(String(key))
          ),
      });
    },
  });

  // unsave
  const { mutate: unsaveMutation } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/post/${post.id}/save`);
    },
    onMutate: async (newData: PostPopulated) => {
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

    // Always refetch after error or success:
    onSuccess: (newData: any) => {
      // queryClient.invalidateQueries({ queryKey: ["posts-query", newData?.id] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.every((key) =>
            ["posts-query", "saved-posts", "saved-count"].includes(String(key))
          ),
      });
    },
  });

  const hasSaved = () => {
    const list = post?.saveIds || [];

    return list.includes(user?.id!);
  };

  const toggleSave = useCallback(async () => {
    try {
      let request: () => void;

      if (hasSaved()) {
        request = () => unsaveMutation(post);
      } else {
        request = () => saveMutation(post);
      }

      // await request();
      request();

      router.refresh();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }

      console.log("Something went wrong");
    }
  }, [user, hasSaved, post.id]);

  return {
    hasSaved,
    toggleSave,
  };
};

export default useSavePost;

/**
 * issue: invalidate multiple queries?
 * https://www.reddit.com/r/reactjs/comments/17u2nll/tanstack_react_query_invalidatequeries/
 */
