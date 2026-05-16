"use client";

import { Skeleton } from "@/components/ui/skeleton";

const OldSkeleton = () => {
  return (
    <div className="mt-10 space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col">
          <div className="flex items-center gap-2 mx-1 mb-4">
            <Skeleton className="size-7.5 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="rounded-sm w-full bg-[#30363E] border border-[#444C56] p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default OldSkeleton;
