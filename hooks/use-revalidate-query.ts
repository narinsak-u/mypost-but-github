"use client";

import { PostPopulated } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export const useValidateQuery = () => {
    const queryClient = useQueryClient();

    // replace post in infinite queries
    const replacePostInInfiniteQueries = (post: PostPopulated) => {
        queryClient.setQueriesData(
            {
                predicate: (query) => String(query.queryKey[0]) === "posts-query",
            },
            (oldData: any) => {
                if (!oldData?.pages?.length) return oldData;
                const pages = oldData.pages.map((page: any) => {
                    if (!Array.isArray(page)) return page;
                    return page.map((p: any) => (p?.id === post.id ? post : p));
                });

                return { ...oldData, pages };
            }
        );
    };

    // revalidates all queries created by useGetPosts
    const invalidatePostQueries = async () => {
        await queryClient.invalidateQueries({
            predicate: (query) => String(query.queryKey[0]) === "posts-query",
        });
        await queryClient.invalidateQueries({ queryKey: ["starred-count"] });
    };

    // validate post queries
    const validatePostQueries = async (post: PostPopulated) => {
        replacePostInInfiniteQueries(post);
        await invalidatePostQueries();
    };

    return { replacePostInInfiniteQueries, invalidatePostQueries, validatePostQueries };
};

export const useRevalidateQuery = useValidateQuery;
