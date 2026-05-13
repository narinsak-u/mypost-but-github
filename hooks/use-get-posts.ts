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
  const { tab } = useSavedTab();
  const normalizedTab = tab.trim().toLowerCase();
  const resolvedLimit = limit ?? 10;

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["posts-query", normalizedTab, userId ?? "all", resolvedLimit],
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
