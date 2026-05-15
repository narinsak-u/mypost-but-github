"use client";

import useChatStore from "@/store/use-chat-store";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import { cn } from "@/lib/utils";
import { ChevronLeft, X, Minus, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatDialog = () => {
  const { isOpen, close, currentConversationId, open, isCollapsed, toggleCollapse } = useChatStore();

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 right-0 sm:right-4 z-[50] flex flex-col bg-[#1F1F1F] border border-[#30363D] shadow-2xl transition-all duration-300 ease-in-out overflow-hidden rounded-t-xl",
        isCollapsed ? "h-[48px] w-72" : "h-[500px] w-full max-w-[400px] sm:max-w-3xl"
      )}
    >
      {/* Custom Header */}
      <div 
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
        className="h-[48px] px-4 flex items-center justify-between border-b border-[#30363D] bg-[#262D34] cursor-pointer"
        onClick={() => toggleCollapse()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCollapse();
          }
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
           {/* If collapsed and has conversation, show context (Option B) */}
           {isCollapsed && currentConversationId ? (
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-[#30363D]" />
               <span className="text-sm font-medium text-[#C9D1D9] truncate">Conversation</span>
             </div>
           ) : (
             <span className="text-sm font-medium text-[#C9D1D9]">Direct Messages</span>
           )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#8B949E] hover:text-white hover:bg-[#30363D]"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#8B949E] hover:text-white hover:bg-[#30363D]"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content (Hidden when collapsed) */}
      <div className={cn("flex-1 flex overflow-hidden", isCollapsed && "hidden")}>
        {/* Sidebar - Conversation List */}
        <div
          className={cn(
            "w-full sm:w-72 h-full shrink-0 border-r border-[#30363D]",
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
            <div className="flex-1 flex flex-col relative h-full [&>div:last-child>div:first-child]:pl-14 sm:[&>div:last-child>div:first-child]:pl-4">
              {/* Mobile Back Button */}
              <div className="sm:hidden absolute top-3 left-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => open(null)}
                  className="h-10 w-10 rounded-full bg-[#1F1F1F]/80 backdrop-blur-sm shadow-sm border border-[#30363D] text-[#C9D1D9] hover:bg-[#262D34]"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
              <MessageThread conversationId={currentConversationId} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-[#1F1F1F]">
              <div className="bg-[#262D34] rounded-full p-6 mb-4 border border-[#30363D]">
                <svg
                  className="w-12 h-12 text-[#8B949E]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#C9D1D9]">Select a message</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDialog;
