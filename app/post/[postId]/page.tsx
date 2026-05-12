import getPopularPosts from "@/actions/get-popular-posts";
import { db } from "@/lib/prismadb";
import getPosts from "@/actions/get-posts";

import LeftContent from "@/components/contents/LeftContent";
import MainContent from "@/components/contents/Main";
import RightContent from "@/components/contents/RightContent";
import PostItem from "@/components/posts/PostItem";
import getPostById from "@/actions/get-post-by-id";
import { PostPopulated } from "@/types";
import Link from "next/link";
import { db } from "@/lib/prismadb";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    postId: string;
  }>;
};

const PostPage = async ({ params }: Props) => {
  const { postId } = await params;

  const [users, popularPosts, posts, post] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
    }),
    getPopularPosts(),
    getPosts(),
    getPostById(postId),
  ]);

  const typedPost = post as PostPopulated;

  return (
    <>
      <div className="col-span-1 hidden sm:block xl:ms-8">
        <LeftContent users={JSON.parse(JSON.stringify(users))} posts={posts} />
      </div>
      <div className="col-span-3 sm:col-span-2">
        <MainContent>
          <PostItem post={typedPost} isPost />
        </MainContent>
      </div>
      <div className="col-span-1 hidden lg:flex lg:mx-auto ">
        <RightContent popularPosts={popularPosts} />
      </div>
    </>
  );
};

export default PostPage;