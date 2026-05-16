"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/actions/get-messages";
import useChatStore from "@/store/use-chat-store";

export const useGetMessages = (conversationId: string | null) => {
  const isOpen = useChatStore((state) => state.isOpen);
  const isCollapsed = useChatStore((state) => state.isCollapsed);

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
    enabled: !!conversationId && isOpen,
    // Only poll if chat is open and NOT collapsed
    refetchInterval: isOpen && !isCollapsed ? 30000 : false,
    staleTime: 15000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
