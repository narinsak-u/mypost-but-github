import getPopularPosts from "@/actions/get-popular-posts";
import { clerkClient } from "@clerk/nextjs/server";
import getPosts from "@/actions/get-posts";

import LeftContent from "@/components/contents/LeftContent";
import MainContent from "@/components/contents/Main";
import RightContent from "@/components/contents/RightContent";
import PostItem from "@/components/posts/PostItem";
import getPostById from "@/actions/get-post-by-id";
import { PostPopulated } from "@/types";

type Props = {
  params: {
    postId: string;
  };
};

const PostPage = async ({ params }: Props) => {
  const client = await clerkClient();
  const users = await client.users.getUserList();
  const popularPosts = await getPopularPosts();
  const posts = await getPosts();
  const post = (await getPostById(params.postId)) as PostPopulated;

  return (
    <>
      <div className="col-span-1 hidden sm:block xl:ms-8">
        <LeftContent
          users={JSON.parse(JSON.stringify(users.data))}
          posts={posts}
        />
      </div>
      <div className="col-span-3 sm:col-span-2">
        <MainContent>
          <PostItem post={post} isPost />
        </MainContent>
      </div>
      <div className="col-span-1 hidden lg:flex lg:mx-auto ">
        <RightContent popularPosts={popularPosts} />
      </div>
    </>
  );
};

export default PostPage;
