"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useChatStore from "@/store/use-chat-store";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatDialog = () => {
  const { isOpen, close, currentConversationId, open } = useChatStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 overflow-hidden flex flex-col sm:flex-row">
        <DialogHeader className="sr-only">
          <DialogTitle>Direct Messages</DialogTitle>
        </DialogHeader>

        {/* Sidebar - Conversation List */}
        <div
          className={cn(
            "w-full sm:w-80 h-full shrink-0 border-r",
            currentConversationId && "hidden sm:flex",
          )}
        >
          <ConversationList />
        </div>

        {/* Main Content - Message Thread */}
        <div
          className={cn(
            "flex-1 h-full min-w-0 flex flex-col",
            !currentConversationId && "hidden sm:flex",
          )}
        >
          {currentConversationId ? (
            <div className="flex-1 flex flex-col relative h-full">
              {/* Mobile Back Button */}
              <div className="sm:hidden absolute top-4 left-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => open(null)}
                  className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
              <MessageThread conversationId={currentConversationId} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="bg-muted rounded-full p-6 mb-4">
                <svg
                  className="w-12 h-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Select a message</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Choose from your existing conversations or start a new one to
                begin chatting.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
