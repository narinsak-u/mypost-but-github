"use client";

import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/actions/get-conversations";
import { queryKeys } from "@/lib/query-keys";

export const useGetConversations = () => {
  return useQuery({
    queryKey: queryKeys.conversations.all,
    queryFn: async () => {
      const result = await getConversations();
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    refetchInterval: 5000,
  });
};
