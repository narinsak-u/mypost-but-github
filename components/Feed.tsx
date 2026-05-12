"use client";

import Skeleton from "./Skeleton";
import PostItem from "./posts/PostItem";
import LoadMore from "./LoadMore";

import { useGetPosts } from "@/hooks/use-get-posts";
import useSavedTab from "@/store/use-saved-tab";

type Props = {
  isProfile?: boolean;
  userId?: string;
};

const Feed = ({ isProfile, userId }: Props) => {
  const { isSelected } = useSavedTab();

  const { posts, hasNextPage, isFetchingNextPage, loadNextPost, isFetching } =
    useGetPosts({
      limit: 3,
      userId,
    });

  return (
    <div>
      {!isSelected && !posts.length && <Skeleton />}
      {posts.map((post) => (
        <PostItem key={post.id} post={post} isProfile={isProfile} />
      ))}

      <LoadMore
        loadNextPost={loadNextPost}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};

export default Feed;
