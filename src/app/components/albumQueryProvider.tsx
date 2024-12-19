"use client";
import { ImageStoreProvider } from "~/store/zustandProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import PhotoAlbumPage from "./photo-album-page";
type AlbumType = {
  id: number;
  name: string;
  description: string;
};
export default function PhotoAlbumProvider({ album }: { album: AlbumType }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ImageStoreProvider>
        <PhotoAlbumPage album={album} />
      </ImageStoreProvider>
    </QueryClientProvider>
  );
}
