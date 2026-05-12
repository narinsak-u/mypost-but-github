"use server";

import { db } from "@/lib/prismadb";
import { getCurrentSession } from "@/lib/auth-helpers";

// toggle follow
export const toggleFollow = async (followingId: string) => {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  if (!followingId) {
    return { error: "Following user not found" };
  }

  if (userId === followingId) {
    return { error: "You cannot follow yourself" };
  }

  // Check if user already follows this user
  try {
    const existingFollow = await db.follow.findFirst({
      where: { followingId, followerId: userId },
    });

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
    } else {
      // Follow
      await db.follow.create({
        data: {
          followingId,
          followerId: userId,
        },
      });
    }

    return { success: true, followed: !existingFollow };
  } catch (error) {
    return { error: "Could not follow. Please try later" };
  }
};

// get is following
export const getIsFollowing = async (followingId: string) => {
  const session = await getCurrentSession();

  if (!session?.user?.id || !followingId) {
    return { isFollowing: false };
  }

  const userId = session.user.id;

  try {
    const existingFollow = await db.follow.findFirst({
      where: { followingId, followerId: userId },
    });

    return { isFollowing: Boolean(existingFollow) };
  } catch (error) {
    return { isFollowing: false };
  }
};

// get user followers
export const getUserFollowers = async (userId: string) => {
  try {
    const followers = await db.follow.findMany({
      where: {
        followingId: userId,
      },
    });
    return { followersCount: followers.length };
  } catch (error) {
    console.log(error);
    return { followersCount: 0 };
  }
};

// get user following
export const getUserFollowing = async (userId: string) => {
  try {
    const following = await db.follow.findMany({
      where: {
        followerId: userId,
      },
    });
    return { followingCount: following.length };
  } catch (error) {
    console.log(error);
    return { followingCount: 0 };
  }
};
