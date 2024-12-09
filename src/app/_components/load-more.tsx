"use client";
import LoadingSpinnerSVG from "~/components/ui/spinner";
import Image from "next/image";
import Link from "next/link";
import { fetchImages } from "~/server/actions/fetchImages";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MotionDiv } from "~/components/ui/MotionDiv";
import {
  useSelectedImages,
  useToggleImageSelection,
  useClearSelection,
} from "~/store/zustandProvider";

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
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const LoadMore: React.FC<LoadMoreClientProps> = ({ initialImages }) => {
  const selectedImages = useSelectedImages();
  const toggleImageSelection = useToggleImageSelection();
  const clearSelection = useClearSelection();
  const { ref, inView } = useInView();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
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
  const getRandomDelay = () => Math.random() * (0.5 - 0.1) + 0.1;
  const handleSelectClick = (id: number) => {
    toggleImageSelection(id);
  };
  return (
    <>
      <div className="flex flex-wrap justify-center gap-4 p-4">
        {images.map((image, index) => (
          <MotionDiv
            key={image.id}
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{
              delay: getRandomDelay(),
              ease: "easeInOut",
              duration: 0.3,
            }}
            className="group relative flex h-auto w-64 cursor-pointer flex-col overflow-hidden text-ellipsis whitespace-nowrap"
          >
            <Link href={`/img/${image.id}`}>
              <Image
                src={image.url}
                style={{ objectFit: "cover" }}
                width={192}
                height={192}
                alt={image.name}
                className="aspect-4/5 rounded-lg"
              />
            </Link>
            {selectedImages.has(image.id) ? (
              <label
                onClick={() => handleSelectClick(image.id)}
                className="absolute bottom-7 right-16 opacity-100 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </label>
            ) : (
              <label
                onClick={() => handleSelectClick(image.id)}
                className="absolute bottom-7 right-16 opacity-0 transition group-hover:opacity-100"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-400 hover:border-blue-500 hover:bg-gray-700"></div>
              </label>
            )}
            <p>{image.name}</p>
          </MotionDiv>
        ))}
      </div>
      {hasNextPage && (
        <div ref={ref} className="flex w-full items-center justify-center p-4">
          <LoadingSpinnerSVG />
        </div>
      )}
    </>
  );
};

export default LoadMore;
