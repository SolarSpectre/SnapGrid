"use client";
import { LoadingSpinnerSVG } from "~/components/ui/SVG";
import { fetchImages } from "~/server/actions/fetchImages";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { UploadDropzone } from "~/utils/uploadthing";
import posthog from "posthog-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "./album";
import { Button } from "~/components/ui/button";
import { fetchAlbumServer } from "~/server/actions/fetchAlbums";
import { Images } from "./images";
const OPTIONS: EmblaOptionsType = { loop: true };

// Define the type for an image object
type ImageType = {
  id: number;
  name: string;
  url: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
};

// Props type for Images component
type LoadMoreClientProps = {
  initialImages: ImageType[];
};

type PaginatedResponse = {
  images: ImageType[];
  nextPage: number | undefined;
};
const fetchImagesPaginated = async (
  page: number,
): Promise<PaginatedResponse> => {
  const images = await fetchImages(page);
  return {
    images,
    nextPage: images.length > 0 ? page + 1 : undefined,
  };
};

const fetchAlbums = async () => {
  const albums = await fetchAlbumServer();
  return albums;
};
const LoadMore: React.FC<LoadMoreClientProps> = ({ initialImages }) => {

  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["images"],
    queryFn: ({ pageParam = 0 }) => fetchImagesPaginated(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse) => lastPage.nextPage,
    initialData: {
      pages: [{ images: initialImages, nextPage: 1 }],
      pageParams: [0],
    },
  });

  const images = data?.pages.flatMap((page) => page.images) || [];
  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const router = useRouter();

  const { data: albumData } = useQuery({
    queryKey: ["albums"],
    queryFn: fetchAlbums,
  });
  return (
    <>
      {initialImages.length === 0 ? (
       <div className="h-full w-full text-center text-2xl">
          Please Upload an image
        </div> 
      ) : (
        <>
          {albumData?.length === 0 ? (
            <div className="flex flex-wrap justify-center gap-4 p-4">
              <Button variant="default">Create Album</Button>
            </div>
          ) : albumData ? (
            <EmblaCarousel
              slides={albumData.map((album) => album.name)}
              options={OPTIONS}
            />
          ) : null}
        <Images images={images}/>
        </>
      )}
      {hasNextPage && (
        <div ref={ref} className="flex w-full items-center justify-center p-4">
          <LoadingSpinnerSVG />
        </div>
      )}
    </>
  );
};

export default LoadMore;
