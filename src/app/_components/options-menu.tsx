"use client";

import * as React from "react";
import { MoreHorizontal, Check, Share2, Album, Trash2, ChevronRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useToggleImageSelection } from "~/store/zustandProvider";
import { deleteImg } from "~/server/actions/imagesActions";
import { useUser } from "@clerk/nextjs";
import { LoadingSpinnerSVG } from "~/components/ui/SVG";
import { addImageAlbum } from "~/server/actions/albumActions";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";
interface MenuProps {
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
  id: number;
}
export function MoreOptionsMenu({ albums,id }: MenuProps) {
  const { user } = useUser();
  const posthog = usePostHog();
  const toggleImageSelection = useToggleImageSelection();
  const handleSelectClick = (id: number) => {
    toggleImageSelection(id);
  };
    const handleAddToAlbum = async (albumId: number) => {
    if (!user?.id) {
      toast.error("Unauthorized");
      return;
    }

    try {
      posthog.capture("add-begin");
      toast(
        <div className="flex items-center gap-2 text-white">
          <LoadingSpinnerSVG />
          <span className="text-lg">Adding Image...</span>
        </div>,
        {
          duration: 100000,
          id: "add-begin",
        },
      );

      const message = await addImageAlbum({ albumId, imageId: id });
      toast.dismiss("add-begin");
      toast.success(message.message);
    } catch (error: unknown) {
      toast.dismiss("add-begin");
      if (error instanceof Error) {
        posthog.capture("error", { error: error.message });
        toast.error(`Failed Adding Image: ${error.message}`);
      } else {
        posthog.capture("error", { error: "Unknown error" });
        toast.error("Failed Adding Image: Unknown error");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-black bg-white hover:border-blue-500 hover:bg-white"
        >
          <MoreHorizontal className="h-4 w-4 text-black" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-48">
        <DropdownMenuItem onSelect={() => handleSelectClick(id)}>
          <Check className="h-4 w-4" />
          <span>Select</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Album className="h-4 w-4" />
            <span>Save in album</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {albums?.map((album) => (
              <DropdownMenuItem
                key={album.id}
                onSelect={() => handleAddToAlbum(album.id)}
              >
                {album.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={async () => deleteImg(id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}