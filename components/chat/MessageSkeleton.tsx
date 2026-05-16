"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const MessageSkeleton = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#1F1F1F]">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-[#30363D] flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {["msg-1", "msg-2", "msg-3", "msg-4", "msg-5"].map((id, idx) => (
          <div
            key={id}
            className={`flex ${idx % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex flex-col gap-1 ${idx % 2 === 0 ? "items-end" : "items-start"} max-w-[80%]`}
            >
              <Skeleton
                className={`h-10 w-48 rounded-2xl ${
                  idx % 2 === 0
                    ? "rounded-tr-none bg-[#238636]/20"
                    : "rounded-tl-none bg-[#30363D]"
                }`}
              />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
