"use client";

import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

type Props = {
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadNextPost: () => Promise<void>;
};

const LoadMore = ({ loadNextPost, hasNextPage, isFetchingNextPage }: Props) => {
  return (
    <div
      className={cn(
        `flex items-center border justify-center p-3 my-12  border-[#444C56]`,
        isFetchingNextPage ? "cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={loadNextPost}
    >
      {!isFetchingNextPage && <Rocket size={20} className="mr-2" />}
      <div className="text-sm font-semibold text-[#006EED] hover:text-sky-700">
        {isFetchingNextPage
          ? "Loading..."
          : hasNextPage
            ? "More"
            : "No more post"}
      </div>
    </div>
  );
};

export default LoadMore;
