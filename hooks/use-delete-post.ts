"use client";

import { useDeleteMutation, useInvalidationKeys } from "./use-mutation-utils";

const useDeletePost = () => {
  const invalidateKeys = useInvalidationKeys("delete");
  const { deletePost, isPending } = useDeleteMutation({ invalidateKeys });

  return { deletePost, isPending };
};

export default useDeletePost;
