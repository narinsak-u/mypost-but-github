"use client";

import { useGetConversations } from "@/hooks/use-get-conversations";
import useChatStore from "@/store/use-chat-store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationWithParticipants } from "@/types";

const ConversationList = () => {
  const { data: session } = authClient.useSession();
  const { data: conversations, isLoading } = useGetConversations();
  const { currentConversationId, open } = useChatStore();

  const currentUser = session?.user;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-3 w-[80%]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const conversationList = (conversations as ConversationWithParticipants[]) || [];

  if (conversationList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-sm text-muted-foreground">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>
      <div className="flex-1">
        {conversationList.map((conversation) => {
          const otherParticipant = conversation.participants.find(
            (p) => p.id !== currentUser?.id
          );
          const lastMessage = conversation.messages[0];
          const isActive = currentConversationId === conversation.id;

          return (
            <button
              key={conversation.id}
              onClick={() => open(conversation.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 transition-colors hover:bg-muted/50 text-left",
                isActive && "bg-muted"
              )}
            >
              <UserAvatar
                imageUrl={otherParticipant?.image}
                name={otherParticipant?.name}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-medium truncate">
                    {otherParticipant?.name || "User"}
                  </span>
                  {conversation.lastMessageAt && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {lastMessage.senderId === currentUser?.id ? "You: " : ""}
                    {lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
