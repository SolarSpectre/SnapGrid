// src/app/_components/PhotoAlbumClient.tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Images } from "~/app/_components/images";
import { fetchAlbumImages } from "~/server/actions/albumActions";
import { useSelectedImages } from "~/store/zustandProvider";

type AlbumType = {
  id: number;
  name: string;
  description: string;
};

type ImageType = {
  id: number;
  name: string;
  url: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
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

export default function PhotoAlbumPage({ album }: { album: AlbumType }) {
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
    <>
      <h1 className="break-words text-center font-mono text-xl font-semibold">
        {album.name}
      </h1>
      <p className="break-words text-center font-mono text-sm font-normal">
        {album.description}
      </p>
      {images.length > 0 ? (
        <Images images={images} selectedImages={selectedImages} />
      ) : (
        <div className="h-full w-full text-center text-2xl">
          Add Images to the album
        </div>
      )}
      <div ref={ref} className="h-8" />
    </>
  );
}
