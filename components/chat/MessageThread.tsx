"use client";

import { useEffect, useRef } from "react";
import { useGetMessages } from "@/hooks/use-get-messages";
import { authClient } from "@/lib/auth-client";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { MessageSkeleton } from "./MessageSkeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useGetConversations } from "@/hooks/use-get-conversations";
import { useChatScroll } from "@/hooks/use-chat-scroll";

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const { data: session } = authClient.useSession();
  const { data: messages, isLoading } = useGetMessages(conversationId);
  const { data: conversations } = useGetConversations();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = session?.user;

  const currentConversation = conversations?.find(
    (c: any) => c.id === conversationId,
  );
  const otherParticipant = currentConversation?.participants.find(
    (p: any) => p.id !== currentUser?.id,
  );

  const messageList = (messages && !("error" in messages) ? messages : []) as any[];

  useChatScroll({
    chatRef: scrollRef,
    count: messageList.length,
    shouldScroll: true,
  });

  if (isLoading) {
    return <MessageSkeleton />;
  }


  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[#1F1F1F]">
      {/* Header */}
      <div className="p-4 border-b border-[#30363D] flex items-center gap-3 shrink-0 bg-[#1F1F1F]">
        <UserAvatar
          imageUrl={otherParticipant?.image || "https://github.com/shadcn.png"}
          name={otherParticipant?.name}
          size="lg"
        />
        <div>
          <h3 className="font-semibold truncate text-[#C9D1D9]">
            {otherParticipant?.name || "User"}
          </h3>
          <p className="text-[10px] text-[#8B949E]">
            {otherParticipant?.email}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 p-4 overflow-y-auto"
      >
        <div className="flex flex-col">
          {messageList.length > 0 ? (
            messageList.map((message: any) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser?.id}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center text-[#8B949E]">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs">
                Send a message to start the conversation!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
};

export default MessageThread;
