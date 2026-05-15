"use client";

import { Message } from "@prisma/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
          isOwn
            ? "bg-blue-700 text-white rounded-tr-none"
            : "bg-[#262D34] text-[#C9D1D9] rounded-tl-none",
        )}
      >
        <div className="wrap-break-word">{message.content}</div>
        <div
          className={cn(
            "text-[10px] mt-1 opacity-60",
            isOwn ? "text-blue-100 text-right" : "text-[#8B949E] text-left",
          )}
        >
          {format(new Date(message.createdAt), "HH:mm")}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
