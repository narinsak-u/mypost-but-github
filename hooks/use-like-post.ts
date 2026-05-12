"use client";

import { useCallback, useMemo } from "react";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
// import { like, unlike } from "@/actions/serverActions";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostPopulated } from "../types";
import { useUser } from "@clerk/nextjs";

type Props = {
  post: PostPopulated;
};

const useLike = ({ post }: Props) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Get access to query client instance
  const queryClient = useQueryClient();

  // Check if user is loaded
  if (!isLoaded) return { isLoading: true };

  // like
  const { mutate: likeMutation } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/post/${post.id}/like`);
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
            ["posts-query", "saved-posts"].includes(String(key))
          ),
      });
    },
  });

  // unlike
  const { mutate: unlikeMutation } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/post/${post.id}/like`);
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
            ["posts-query", "saved-posts"].includes(String(key))
          ),
      });
    },
  });

  const hasLiked = () => {
    const list = post?.likedIds || [];
    return list.includes(user?.id!);
  }

  const toggleLike = useCallback(async () => {
    try {
      let request: () => void;

      if (hasLiked()) {
        request = () => unlikeMutation(post);
      } else {
        request = () => likeMutation(post);
      }

      request();
      // request();

      router.refresh();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }

      console.log("Something went wrong");
    }
  }, [user, hasLiked, post.id]);

  return {
    hasLiked,
    toggleLike,
  };
};

export default useLike;
