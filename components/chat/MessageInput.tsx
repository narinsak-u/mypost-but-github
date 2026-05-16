"use client";

import { useState, useRef, useEffect } from "react";
import { useSendMessage } from "@/hooks/use-send-message";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";

interface MessageInputProps {
  conversationId: string;
}

const MessageInput = ({ conversationId }: MessageInputProps) => {
  const [content, setContent] = useState("");
  const { mutate: sendMessage, isPending } = useSendMessage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!content.trim() || isPending) return;
    sendMessage({ conversationId, content });
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = "auto";
    textarea.style.height = `${scrollHeight}px`;
  }, [content]);

  return (
    <div className="p-4 border-t border-[#30363D] bg-[#1F1F1F]">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          className="flex-1 min-h-10 max-h-32 p-2 rounded-lg border border-[#30363D] bg-[#161B22] text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all scrollbar-hide text-sm placeholder:text-[#8B949E]"
          disabled={isPending}
        />
        <Button
          size="icon"
          disabled={!content.trim() || isPending}
          onClick={handleSend}
          className="shrink-0 bg-blue-700 hover:bg-blue-800 text-white"
        >
          <SendHorizonal className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
