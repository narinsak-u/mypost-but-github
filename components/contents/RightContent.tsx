"use client";

import { PostPopulated } from "@/types";
import { ArrowUpNarrowWide } from "lucide-react";
import PostItem from "../posts/PostItem";

type Props = {
  popularPosts?: PostPopulated[] | null;
};

const RightContent = ({ popularPosts: posts }: Props) => {
  if (!posts) return <>Loading...</>;

  return (
    <div className="h-full w-full p-10 lg:max-w-sm">
      <div className=" sticky top-10 z-50">
        <div className="flex items-center justify-start gap-3 font-semibold">
          <ArrowUpNarrowWide />
          <div className="text-sm">Popular Posts</div>
        </div>

        <div className="my-4">
          {posts.map((post, index) => (
            <PostItem key={post.id} post={post} isRanked index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightContent;
