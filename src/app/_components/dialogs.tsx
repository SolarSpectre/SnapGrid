"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
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
import {
  addImageAlbum,
  addImagesAlbum,
  createAlbum,
} from "~/server/actions/albumActions";
import { LoadingSpinnerSVG } from "~/components/ui/SVG";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";
import { useRouter } from "next/navigation";

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
export function AddImagesDialog({
  albums,
  selectedImages,
}: AddImagesProps) {
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
