"use client";

import * as React from "react";
import { MoreHorizontal, Check, Share2, Album, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { deleteImg } from "~/server/actions/deleteImage";
import { useToggleImageSelection } from "~/store/zustandProvider";

export function MoreOptionsMenu(props: { id: number }) {
    const toggleImageSelection = useToggleImageSelection();
    const handleSelectClick = (id: number) => {
    toggleImageSelection(id);
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
      <DropdownMenuContent side="top" align="end" className="w-10">
        <DropdownMenuItem onSelect={() => handleSelectClick(props.id)}>
          <Check className="h-4 w-4" />
          <span>Select</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Album className="h-4 w-4" />
          <span >Save in album</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={async () => deleteImg(props.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
