"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "./keys";

type ToggleConfig = {
  endpoint: "/like" | "/save";
  invalidateKeys: (string | number)[][];
};

type DeleteConfig = {
  invalidateKeys: (string | number)[][];
};

type CreateConfig = {
  invalidateKeys: (string | number)[][];
};

export function useToggleMutation(config: ToggleConfig) {
  const queryClient = useQueryClient();

  const { mutate: addAction } = useMutation({
    mutationFn: async (postId: string) => {
      await axios.post(`/api/post/${postId}${config.endpoint}`);
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      const previousData = queryClient.getQueryData(
        queryKeys.posts.detail(postId),
      );
      return { previousData, postId };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.posts.detail(context.postId),
          context.previousData,
        );
      }
    },
    onSuccess: () => {
      config.invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });

  const { mutate: removeAction } = useMutation({
    mutationFn: async (postId: string) => {
      await axios.delete(`/api/post/${postId}${config.endpoint}`);
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      const previousData = queryClient.getQueryData(
        queryKeys.posts.detail(postId),
      );
      return { previousData, postId };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.posts.detail(context.postId),
          context.previousData,
        );
      }
    },
    onSuccess: () => {
      config.invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });

  return { addAction, removeAction };
}

export function useDeleteMutation(config: DeleteConfig) {
  const queryClient = useQueryClient();

  const { mutateAsync: deletePost, isPending } = useMutation({
    mutationFn: async (postId: string) => {
      return await axios.delete(`/api/post/${postId}`);
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      const previousData = queryClient.getQueryData(
        queryKeys.posts.detail(postId),
      );
      return { previousData, postId };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.posts.detail(context!.postId),
          context.previousData,
        );
      }
    },
    onSuccess: () => {
      config.invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });

  return { deletePost, isPending };
}

export function useCreateMutation(config: CreateConfig) {
  const queryClient = useQueryClient();

  const { mutateAsync: createPost, isPending } = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await axios.post(`/api/post`, { ...payload });
      return data;
    },
    onMutate: async (newData: Record<string, unknown>) => {
      const postId = newData.id as string;
      await queryClient.cancelQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      const previousData = queryClient.getQueryData(
        queryKeys.posts.detail(postId),
      );
      queryClient.setQueryData(queryKeys.posts.detail(postId), newData);
      return { previousData, postId };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.posts.detail(context.postId),
          context.previousData,
        );
      }
    },
    onSuccess: () => {
      config.invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });

  return { createPost, isPending };
}

const asQueryKey = (key: readonly (string | number)[]) => [...key];

export function useInvalidationKeys(type: "like" | "save" | "delete") {
  if (type === "like") {
    return [asQueryKey(queryKeys.posts.all), asQueryKey(queryKeys.posts.saved)];
  }
  if (type === "save") {
    return [
      asQueryKey(queryKeys.posts.all),
      asQueryKey(queryKeys.posts.saved),
      asQueryKey(queryKeys.counts.saved),
    ];
  }
  return [asQueryKey(queryKeys.posts.all), asQueryKey(queryKeys.posts.saved)];
}
