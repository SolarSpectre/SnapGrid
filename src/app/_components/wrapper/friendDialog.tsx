import { auth } from "@clerk/nextjs/server";
import { FriendDialog } from "../dialogs";
import { getFriends, getUsers } from "~/server/actions/friendActions";

export async function FriendDialogWrapper() {
  const { userId } = await auth();
  if (!userId) return null;

  const [friends, users] = await Promise.all([
    getFriends(userId),
    getUsers(userId),
  ]);

  return <FriendDialog friends={friends} users={users} userId={userId} />;
}
