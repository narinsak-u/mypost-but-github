"use client";

import { FormData, PostPopulated } from "@/types";
import { useCreateMutation } from "./use-mutation-utils";
import { queryKeys } from "./keys";

const useCreatePost = () => {
  const { createPost, isPending } = useCreateMutation({
    invalidateKeys: [[...queryKeys.posts.all]],
  });

  return {
    createPost: createPost as (payload: FormData) => Promise<PostPopulated>,
    isPending,
  };
};

export default useCreatePost;
