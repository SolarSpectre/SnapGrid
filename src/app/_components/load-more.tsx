"use client";
import { LoadingSpinnerSVG } from "~/components/ui/SVG";
import { fetchImages } from "~/server/actions/imagesActions";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import EmblaCarousel from "./album";
import { Images } from "./images"
import {AddImagesDialog, CreateAlbumDialog} from "./dialogs";
import { useSelectedImages } from "~/store/zustandProvider";
import { fetchAlbumServer } from "~/server/actions/albumActions";
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

  const { data: albumData } = useQuery({
    queryKey: ["albums"],
    queryFn: fetchAlbums,
  });
 const selectedImages = useSelectedImages();
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
              <CreateAlbumDialog />
            </div>
          ) : albumData ? (
            <>
              <EmblaCarousel
                slides={albumData.map((_, index) => index)}
                albumData={albumData}
              />
              <div className="flex justify-center">
              <CreateAlbumDialog />
              {selectedImages && <AddImagesDialog albums={albumData} selectedImages={selectedImages}/>}
              </div>
            </>
          ) : null}
          <Images albums={albumData} images={images} selectedImages={selectedImages}/>
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
