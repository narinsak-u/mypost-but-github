"use client";

import axios from "axios";
import { useCallback, useMemo } from "react";
import { PostPopulated } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import useSavedTab from "../store/use-saved-tab";
import { postKeys } from "@/lib/query-keys";

type Props = {
  limit?: number;
  userId?: string;
};

export const useGetPosts = ({ limit, userId }: Props) => {
  const { isSelected } = useSavedTab();

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: postKeys.feed({ isSelected, userId, limit }),
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
    });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data?.pages],
  );

  const loadNextPost = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { posts, loadNextPost, isFetchingNextPage, hasNextPage, isFetching };
};
