"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/actions/get-messages";
import { queryKeys } from "@/lib/query-keys";

export const useGetMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const result = await getMessages(conversationId);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    enabled: !!conversationId,
    refetchInterval: 10000, // 10 seconds
    staleTime: 5000, // 5 seconds
    retry: 1,
  });
};
