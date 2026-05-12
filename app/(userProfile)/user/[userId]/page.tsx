import getPosts from "@/actions/get-posts";
import { db } from "@/lib/prismadb";
import LeftContent from "@/components/contents/LeftContent";
import MainContent from "@/components/contents/Main";
import Feed from "@/components/Feed";
import Banner from "@/components/Banner";
import Tabs from "@/components/Tabs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

const UserProfile = async ({ params }: Props) => {
  const { userId } = await params;
  const posts = await getPosts();

  const user = await db.user.findUnique({ where: { id: userId } });

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
          <Tabs firstTab="Posts" secondTab="Saved" isProfile owner={userId} />
          <Feed isProfile userId={userId} />
        </MainContent>
      </div>
    </>
  );
};

export default UserProfile;
