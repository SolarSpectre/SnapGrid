"use client";
import { ImageStoreProvider } from "~/store/zustandProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import PhotoAlbumPage from "./photo-album-page";
import { Friend } from "../_components/dialogs";
type AlbumType = {
  id: number;
  name: string;
  description: string;
};
export default function PhotoAlbumProvider({
  album,
  collaborators,
  friends,
}: {
  album: AlbumType;
  collaborators: string[];
  friends: Friend[];
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ImageStoreProvider>
        <PhotoAlbumPage
          album={album}
          collaborators={collaborators}
          friends={friends}
        />
      </ImageStoreProvider>
    </QueryClientProvider>
  );
}
