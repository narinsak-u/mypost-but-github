"use client";

import axios from "axios";
import { useCallback } from "react";
import { PostPopulated } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import useSavedTab from "../store/use-saved-tab";

type Props = {
  limit?: number;
  userId?: string;
};

export const useGetPosts = ({ limit, userId }: Props) => {
  const { isSelected } = useSavedTab();

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: isSelected ? ["posts-query", "saved-posts"] : ["posts-query"],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const query =
          userId && isSelected
            ? `/api/posts/${userId}/saves?limit=${limit}&page=${pageParam}`
            : userId
              ? `/api/posts/${userId}?limit=${limit}&page=${pageParam}`
              : `/api/posts?limit=${limit}&page=${pageParam}`;

        const { data } = await axios.get(query);
        return data as PostPopulated[];
      },
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.length === 0) {
          return null;
        }
        return allPages.length + 1;
      },
      initialData: { pages: [], pageParams: [1] },
      // refetchInterval: 1000, // Refetch every 1 second
    });

  const posts = data?.pages.flatMap((page) => page) ?? [];
  // console.log(posts, "posts");

  // handle load more
  const loadNextPost = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage]);

  return { posts, loadNextPost, isFetchingNextPage, hasNextPage, isFetching };
};
