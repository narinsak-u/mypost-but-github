import getPosts from "@/actions/get-posts";
import { db } from "@/lib/prismadb";
import LeftContent from "@/components/contents/LeftContent";
import MainContent from "@/components/contents/Main";
import RightContent from "@/components/contents/RightContent";
import Feed from "@/components/Feed";
import Tabs from "@/components/Tabs";
import Banner from "@/components/Banner";
import { ProfileBanner } from "@/components/ProfileBanner";
import { UserProfileUser } from "@/types";
import { Suspense } from "react";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

async function UserProfileContent({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const posts = await getPosts();
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  const profileUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!profileUser) {
    return <div>User not found</div>;
  }

  const typedProfileUser: UserProfileUser = {
    id: profileUser.id,
    username: profileUser.name,
    firstName: null,
    lastName: null,
    imageUrl: profileUser.image,
    email: profileUser.email,
    createdAt: profileUser.createdAt.getTime(),
  };

  return (
    <>
      <div className="col-span-1 hidden sm:block xl:ms-8">
        <LeftContent users={JSON.parse(JSON.stringify(users))} posts={posts} />
      </div>
      <div className="col-span-3 sm:col-span-2 lg:pl-10 lg:col-span-3 max-w-4xl">
        <MainContent>
          <Banner isProfile />
          <ProfileBanner
            isOwner={false}
            user={typedProfileUser}
            starCount={0}
            followersCount={0}
            followingCount={0}
            isFollowing={false}
          />
          <Tabs
            firstTab="For You"
            secondTab="Following"
            isProfile
            owner={userId}
          />
          <Feed userId={userId} />
        </MainContent>
      </div>
      <div className="col-span-1 hidden lg:flex lg:mx-auto">
        <RightContent popularPosts={[]} />
      </div>
    </>
  );
}

const UserProfile = ({ params }: Props) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfileContent params={params} />
    </Suspense>
  );
};

export default UserProfile;
