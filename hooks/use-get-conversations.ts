"use client";

import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/actions/get-conversations";
import { queryKeys } from "@/lib/query-keys";
import useChatStore from "@/store/use-chat-store";

export const useGetConversations = () => {
  const isOpen = useChatStore((state) => state.isOpen);

  return useQuery({
    queryKey: queryKeys.conversations.all,
    queryFn: async () => {
      const result = await getConversations();
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    // Only poll when chat is open, at a much longer interval
    refetchInterval: isOpen ? 60000 : false,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
