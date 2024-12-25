"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { UsersIcon } from "lucide-react";
import { MessageCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { friend, users } from "~/server/db/schema";
import {
  acceptFriendRequest,
  sendFriendRequest,
} from "~/server/actions/friendActions";
import {
  addImagesAlbum,
  createAlbum,
  inviteCollaborator,
  removeCollaborator,
} from "~/server/actions/albumActions";
import { LoadingSpinnerSVG } from "~/components/ui/SVG";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";

export function CreateAlbumDialog() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!user?.id) {
      throw new Error("Unauthorized");
    }
    try {
      await createAlbum({ name, description, id: user.id });
    } catch (error) {
      throw new Error("Could not create album: " + error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-b text-xl font-semibold">
          Create Album
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Album</DialogTitle>
          <DialogDescription>
            Fill in the details for your new album and click save.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
interface AddImagesProps {
  albums:
    | {
        name: string;
        id: number;
        description: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date | null;
      }[]
    | undefined;
  selectedImages: Set<number>;
}
export function AddImagesDialog({ albums, selectedImages }: AddImagesProps) {
  const { user } = useUser();
  const [albumId, setAlbumId] = useState<number | null>(null);

  const posthog = usePostHog();
  const handleSubmit = async () => {
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    if (selectedImages.size === 0) {
      throw new Error("No images selected");
    }
    if (!albumId) {
      throw new Error("Please select an album");
    }
    try {
      const imageIds = Array.from(selectedImages);
      posthog.capture("add-begin");
      toast(
        <div className="flex items-center gap-2 text-white">
          <LoadingSpinnerSVG />
          <span className="text-lg">Adding Images...</span>
        </div>,
        {
          duration: 100000,
          id: "add-begin",
        },
      );
      const message = await addImagesAlbum({ albumId, imageIds });
      toast.dismiss("add-begin");
      toast.success(message.message);
    } catch (error: unknown) {
      if (error instanceof Error) {
        posthog.capture("error", { error: error.message });

        toast.dismiss("add-begin");
        toast.error("Failed Adding Images: " + error.message);
      } else {
        posthog.capture("error", { error: "Unknown error" });

        toast.dismiss("add-begin");
        toast.error("Failed Adding Images: Unknown error");
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-b text-xl font-semibold">
          Add Images
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Images</DialogTitle>
          <DialogDescription>
            Choose the album and click save.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="album" className="text-right">
              Album
            </Label>
            <Select
              value={albumId ? albumId.toString() : ""}
              onValueChange={(value) =>
                setAlbumId(value ? Number(value) : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Album" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select an album</SelectLabel>
                  {albums?.map((album) => (
                    <SelectItem key={album.id} value={album.id.toString()}>
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export interface Friend {
  id: number;
  userId: string;
  friendId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  friendUser: User;
}

interface FriendDialogProps {
  friends: Friend[];
  users: User[];
  userId: string;
}

export function FriendDialog({ friends, users, userId }: FriendDialogProps) {
  const [open, setOpen] = useState(false);

  const handleFriendRequest = async (friendId: string) => {
    await sendFriendRequest(userId, friendId);
    setOpen(false);
  };
  const handleAcceptFriend = async (friendId: number) => {
    await acceptFriendRequest(friendId);
  };
  const formatUserName = (user: User) => {
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;
  };
  const renderFriendStatus = (friend: Friend) => {
    const isReceived = friend.friendId === userId;
    const displayUser = isReceived ? friend.user : friend.friendUser;

    return (
      <div
        key={friend.id}
        className="group relative flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
      >
        <span>{formatUserName(displayUser)}</span>
        <div className="flex items-center gap-2">
          {friend.status === "accepted" ? (
            <>
              <span className="text-sm text-muted-foreground">Friends</span>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => console.log("Chat with:", displayUser.id)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {friend.status} {isReceived ? "(Received)" : "(Sent)"}
              </span>
              {friend.status === "pending" && isReceived && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcceptFriend(friend.id)}
                >
                  Accept
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"> Friends</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Friends & Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Friends</h3>
            {friends.length === 0 ? (
              <p className="text-muted-foreground">No friends yet</p>
            ) : (
              <div className="space-y-2">{friends.map(renderFriendStatus)}</div>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">All Users</h3>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <span>{user.email}</span>
                    <Button
                      size="sm"
                      onClick={() => handleFriendRequest(user.id)}
                      disabled={friends.some((f) => f.friendId === user.id)}
                    >
                      Add Friend
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
interface CollaboratorDialogProps {
  albumId: number;
  friends: Friend[];
  collaborators: string[];
}

export function CollaboratorDialog({
  albumId,
  friends,
  collaborators,
}: CollaboratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [localCollaborators, setLocalCollaborators] = useState(collaborators);
  const handleRemoveCollaborator = async (userId: string) => {
    try {
      const updatedCollaborators = await removeCollaborator(albumId, userId);
      setLocalCollaborators(updatedCollaborators);
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
    }
  };
  const handleInvite = async (userId: string) => {
    try {
      const updatedCollaborators = await inviteCollaborator(albumId, userId);
      setLocalCollaborators(updatedCollaborators);
      setOpen(false);
    } catch (error) {
      console.error("Failed to invite collaborator:", error);
    }
  };

  const availableFriends = friends.filter(
    (friend) => !localCollaborators.includes(friend.friendUser.id),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <UsersIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Album Collaborators</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Current Collaborators</h3>
            {localCollaborators.length === 0 ? (
              <p className="text-muted-foreground">No collaborators yet</p>
            ) : (
              <div className="space-y-2">
                {localCollaborators.map((collaboratorId) => {
                  const friend = friends.find(
                    (f) => f.friendUser.id === collaboratorId,
                  );
                  return (
                    friend && (
                      <div
                        key={collaboratorId}
                        className="flex items-center justify-between"
                      >
                        <span>{friend.friendUser.email}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleRemoveCollaborator(collaboratorId)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    )
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Invite Friends</h3>
            {availableFriends.length === 0 ? (
              <p className="text-muted-foreground">
                No friends available to invite
              </p>
            ) : (
              <div className="space-y-2">
                {availableFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between"
                  >
                    <span>{friend.friendUser.email}</span>
                    <Button
                      size="sm"
                      onClick={() => handleInvite(friend.friendUser.id)}
                    >
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
