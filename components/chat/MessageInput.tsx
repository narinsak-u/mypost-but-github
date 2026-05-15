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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          className="flex-1 min-h-10 max-h-32 p-2 rounded-lg border bg-muted focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all scrollbar-hide text-sm"
          disabled={isPending}
        />
        <Button
          size="icon"
          disabled={!content.trim() || isPending}
          onClick={handleSend}
          className="shrink-0"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
