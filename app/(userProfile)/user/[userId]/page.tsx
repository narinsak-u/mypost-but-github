import MainContentWrapper from "@/components/Wrapper";
import Feed from "@/components/Feed";
import Tabs from "@/components/Tabs";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Suspense } from "react";
import Skeleton from "@/components/Skeleton";
import getUserStars from "@/actions/get-user-stars";
import ProfileBanner from "@/components/ProfileBanner";
import { UserProfileUser } from "@/types";
import { getIsFollowing, getUserFollowers, getUserFollowing } from "@/actions/follow-actions";

type Props = {
  params: Promise<{ userId: string }>;
};

const UserProfileContent = async ({ params }: Props) => {
  const { userId } = await params;
  const stars = await getUserStars(userId);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const { followersCount } = await getUserFollowers(userId);
  const { followingCount } = await getUserFollowing(userId);
  const { isFollowing } = await getIsFollowing(userId);

  const { userId: currentUserId } = await auth();
  const isOwner = currentUserId === userId;

  const profileUser: UserProfileUser = {
    id: user.id,
    imageUrl: user.imageUrl,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    createdAt: user.createdAt,
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
