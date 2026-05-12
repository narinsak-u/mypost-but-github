import getPopularPosts from "@/actions/get-popular-posts";
import { clerkClient } from '@clerk/nextjs/server';
import LeftContent from "@/components/contents/LeftContent";
import MainContent from "@/components/contents/Main";
import RightContent from "@/components/contents/RightContent";
import Banner from "@/components/Banner";
import Feed from "@/components/Feed";
import getPosts from "@/actions/get-posts";
import Tabs from "@/components/Tabs";

type Props = {};

const page = async (props: Props) => {
  const client = await clerkClient();
  const users = await client.users.getUserList();
  const popularPosts = await getPopularPosts();
  const posts = await getPosts();

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
          <Banner />
          <Tabs firstTab="Feed" />
          <Feed />
        </MainContent>
      </div>
      <div className="col-span-1 hidden lg:flex lg:mx-auto ">
        <RightContent popularPosts={popularPosts} />
      </div>
    </>
  );
};

export default page;
