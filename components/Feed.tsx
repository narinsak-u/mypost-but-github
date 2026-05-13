"use client";

import Skeleton from "./Skeleton";
import PostItem from "./posts/PostItem";
import LoadMore from "./LoadMore";
import { useGetPosts } from "@/hooks/use-get-posts";

type Props = {
  userId?: string;
};

const Feed = ({ userId }: Props) => {
  const { posts, hasNextPage, isFetchingNextPage, loadNextPost, isFetching } =
    useGetPosts({
      limit: 3,
      userId,
    });

  return (
    <div>
      {isFetching && !posts.length && <Skeleton />}
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
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
