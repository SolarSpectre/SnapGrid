// src/app/_components/PhotoAlbumClient.tsx
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Images } from "~/app/_components/images";
import { fetchImages } from "~/server/actions/fetchImages";

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

const fetchImagesPaginated = async (page: number): Promise<PaginatedResponse> => {
  const images = await fetchImages(page);
  return {
    images,
    nextPage: images.length > 0 ? page + 1 : undefined,
  };
};

export default function PhotoAlbumPage({ album }: { album: AlbumType }) {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["images"],
    queryFn: ({ pageParam = 0 }) => fetchImagesPaginated(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse) => lastPage.nextPage,
  });

  const images = data?.pages.flatMap((page) => page.images) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <>
      <h1 className="text-left break-words font-semibold text-xl font-mono">{album.name}</h1>
      <p className="text-left break-words font-normal text-sm font-mono">{album.description}</p>
      <Images images={images} />
      <div ref={ref} className="h-8" />
    </>
  );
}
