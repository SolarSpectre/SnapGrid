"use server";
import { db } from "~/server/db";
import { friend, users } from "~/server/db/schema";
import { eq, ne } from "drizzle-orm";

export async function getFriends(userId: string) {
  return await db.query.friend.findMany({
    where: (friend, { or, eq }) =>
      or(eq(friend.userId, userId), eq(friend.friendId, userId)),
    with: {
      friendUser: {
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
      user: {
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
  });
}

export async function getUsers(userId: string) {
  return await db.query.users.findMany({
    where: (users, { ne }) => ne(users.id, userId),
  });
}

export async function sendFriendRequest(userId: string, friendId: string) {
  return await db.insert(friend).values({
    userId,
    friendId,
    status: "pending",
  });
}
export async function acceptFriendRequest(friendId: number) {
  try {
    await db
      .update(friend)
      .set({ status: "accepted" })
      .where(eq(friend.id, friendId));
  } catch (error) {
    console.error("Error accepting friend:", error);
    return false;
  }
}
