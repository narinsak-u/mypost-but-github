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
  const { tab } = useSavedTab();
  const normalizedTab = tab.trim().toLowerCase();
  const resolvedLimit = limit ?? 10;

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: postKeys.feed({ isSelected, userId, limit }),
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        let query: string;

        switch (normalizedTab) {
          case "following":
            query = `/api/posts/following?limit=${resolvedLimit}&page=${pageParam}`;
            break;
          case "starred":
            query = `/api/posts/starred?limit=${resolvedLimit}&page=${pageParam}`;
            break;
          default:
            query = userId
              ? `/api/posts/${userId}?limit=${resolvedLimit}&page=${pageParam}`
              : `/api/posts?limit=${resolvedLimit}&page=${pageParam}`;
            break;
        }

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
