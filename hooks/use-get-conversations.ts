"use client";

import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/actions/get-conversations";

export const useGetConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
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
