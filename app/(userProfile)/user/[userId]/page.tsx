import getPosts from "@/actions/get-posts";
import LeftContent from "@/components/contents/LeftContent";
import MainContent from "@/components/contents/Main";
import Feed from "@/components/Feed";
import Banner from "@/components/Banner";
import Tabs from "@/components/Tabs";

import { clerkClient } from "@clerk/nextjs/server";

type Props = {
  params: {
    userId: string;
  };
};

const UserProfile = async ({ params }: Props) => {
  const posts = await getPosts();

  const client = await clerkClient();
  const user = await client.users.getUser(params.userId);

  return (
    <>
      <div className="col-span-1 hidden sm:block xl:ms-8">
        <LeftContent
          posts={posts}
          isProfile
          user={JSON.parse(JSON.stringify(user))}
        />
      </div>
      <div className="col-span-3 sm:col-span-2 lg:pl-10 lg:col-span-3 max-w-4xl">
        <MainContent>
          <Banner isProfile />
          <Tabs
            firstTab="Posts"
            secondTab="Saved"
            isProfile
            owner={params.userId}
          />
          <Feed isProfile userId={params.userId} />
        </MainContent>
      </div>
    </>
  );
};

export default UserProfile;
