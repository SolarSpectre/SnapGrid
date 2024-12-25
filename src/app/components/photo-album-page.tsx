// src/app/_components/PhotoAlbumClient.tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Images } from "~/app/_components/images";
import { ImageType } from "~/lib/types";
import { fetchAlbumImages } from "~/server/actions/albumActions";
import { useSelectedImages } from "~/store/zustandProvider";
import { CollaboratorDialog, Friend } from "../_components/dialogs";

type AlbumType = {
  id: number;
  name: string;
  description: string;
};

type PaginatedResponse = {
  images: ImageType[];
  nextPage: number | undefined;
};

const fetchImagesPaginated = async (
  page: number,
  id: number,
): Promise<PaginatedResponse> => {
  const images = await fetchAlbumImages(page, id);
  return {
    images,
    nextPage: images.length > 0 ? page + 1 : undefined,
  };
};

export default function PhotoAlbumPage({
  album,
  collaborators,
  friends,
}: {
  album: AlbumType;
  collaborators: string[];
  friends: Friend[];
}) {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["images"],
    queryFn: ({ pageParam = 0 }) => fetchImagesPaginated(pageParam, album.id),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse) => lastPage.nextPage,
  });

  const images = data?.pages.flatMap((page) => page.images) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const selectedImages = useSelectedImages();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="break-words text-center font-mono text-3xl font-bold">
              {album.name}
            </h1>
            <CollaboratorDialog
              albumId={album.id}
              collaborators={collaborators}
              friends={friends}
            />
          </div>

          <p className="max-w-2xl break-words text-center font-mono text-gray-600 dark:text-gray-400">
            {album.description}
          </p>

          <div className="h-px w-1/2 bg-gray-200 dark:bg-gray-800" />
        </div>

        {images.length > 0 ? (
          <Images images={images} selectedImages={selectedImages} />
        ) : (
          <div className="mt-12 flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-center text-xl text-gray-500 dark:text-gray-400">
              Add Images to the album
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
