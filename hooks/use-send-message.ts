"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/actions/send-message";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      const result = await sendMessage(conversationId, content);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
