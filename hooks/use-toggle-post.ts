"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { PostPopulated } from "@/types";
import { useSession } from "@/lib/auth-client";
import { useToggleMutation, useInvalidationKeys } from "./use-mutation-utils";

type ToggleField = "likedIds" | "saveIds";
type ToggleEndpoint = "/like" | "/save";

type UseTogglePostFieldProps = {
  post: PostPopulated;
  field: ToggleField;
  endpoint: ToggleEndpoint;
  type: "like" | "save";
};

export function useTogglePostField({
  post,
  field,
  endpoint,
  type,
}: UseTogglePostFieldProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const invalidateKeys = useInvalidationKeys(type);
  const { addAction, removeAction } = useToggleMutation({
    endpoint,
    invalidateKeys,
  });

  if (isPending) return { isLoading: true };

  const hasField = () => {
    const list = post?.[field] || [];
    return list.includes(session?.user?.id!);
  };

  const toggle = useCallback(async () => {
    try {
      if (hasField()) {
        removeAction(post.id);
      } else {
        addAction(post.id);
      }
      router.refresh();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
      console.log("Something went wrong");
    }
  }, [session, hasField, post.id, addAction, removeAction, router]);

  if (field === "likedIds") {
    return { hasLiked: hasField, toggleLike: toggle };
  }
  return { hasSaved: hasField, toggleSave: toggle };
}

export function useLike({ post }: { post: PostPopulated }) {
  return useTogglePostField({
    post,
    field: "likedIds",
    endpoint: "/like",
    type: "like",
  });
}

export function useSavePost({ post }: { post: PostPopulated }) {
  return useTogglePostField({
    post,
    field: "saveIds",
    endpoint: "/save",
    type: "save",
  });
}
