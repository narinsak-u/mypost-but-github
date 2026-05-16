import MainContentWrapper from "@/components/Wrapper";
import Feed from "@/components/Feed";
import Tabs from "@/components/Tabs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import Skeleton from "@/components/OldSkeleton";
import getUserStars from "@/actions/get-user-stars";
import ProfileBanner from "@/components/ProfileBanner";
import { UserProfileUser } from "@/types";
import {
  getIsFollowing,
  getUserFollowers,
  getUserFollowing,
} from "@/actions/follow-actions";
import { db } from "@/lib/prismadb";

type Props = {
  params: Promise<{ userId: string }>;
};

const UserProfileContent = async ({ params }: Props) => {
  const { userId } = await params;

  const [stars, user, session] = await Promise.all([
    getUserStars(userId),
    db.user.findUnique({ where: { id: userId } }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!user) {
    return <div>User not found</div>;
  }

  const [{ followersCount }, { followingCount }, { isFollowing }] =
    await Promise.all([
      getUserFollowers(userId),
      getUserFollowing(userId),
      getIsFollowing(userId),
    ]);

  const currentUserId = session?.user?.id;
  const isOwner = currentUserId === userId;

  const profileUser: UserProfileUser = {
    id: user.id,
    imageUrl: user.image,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.getTime(),
  };

  return (
    <>
      <MainContentWrapper>
        <ProfileBanner
          isOwner={isOwner}
          user={profileUser}
          starCount={stars.starCount}
          followersCount={followersCount}
          followingCount={followingCount}
          isFollowing={isFollowing}
        />
        <Tabs
          firstTab="Overview"
          secondTab="Starred"
          isProfile
          owner={userId}
        />
        <Suspense fallback={<Skeleton />}>
          <Feed userId={userId} />
        </Suspense>
      </MainContentWrapper>
    </>
  );
};

export default function UserProfile(props: Props) {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfileContent params={props.params} />
    </Suspense>
  );
}
