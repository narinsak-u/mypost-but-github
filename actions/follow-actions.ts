"use server";

import { db } from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

// toggle follow
export const toggleFollow = async (followingId: string) => {
    const { userId } = await auth();

    if (!userId) {
        return { error: "Unauthorized" };
    }

    if (!followingId) {
        return { error: "Following user not found" };
    }

    if (userId === followingId) {
        return { error: "You cannot follow yourself" };
    }

    // Check if user already follows this user
    try {
        const existingFollow = await db.follower.findFirst({
            where: { followingId, followerId: userId },
        });

        if (existingFollow) {
            // Unfollow
            await db.follower.delete({
                where: {
                    id: existingFollow.id,
                },
            });
        } else {
            // Follow
            await db.follower.create({
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
}

// get is following
export const getIsFollowing = async (followingId: string) => {
    const { userId } = await auth();

    if (!userId || !followingId) {
        return { isFollowing: false };
    }

    try {
        const existingFollow = await db.follower.findFirst({
            where: { followingId, followerId: userId },
        });

        return { isFollowing: Boolean(existingFollow) };
    } catch (error) {
        return { isFollowing: false };
    }
}

// get user followers
export const getUserFollowers = async (userId: string) => {
    try {
        const followers = await db.follower.findMany({
            where: {
                followingId: userId,
            },
        });
        return { followersCount: followers.length };
    } catch (error) {
        console.log(error);
        return { followersCount: 0 };
    }
}

// get user following
export const getUserFollowing = async (userId: string) => {
    try {
        const following = await db.follower.findMany({
            where: {
                followerId: userId,
            },
        });
        return { followingCount: following.length };
    } catch (error) {
        console.log(error);
        return { followingCount: 0 };
    }
}
