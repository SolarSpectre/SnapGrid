"use client";
import LoadingSpinnerSVG from "~/components/ui/spinner";
import Image from "next/image";
import Link from "next/link";
import { fetchImages } from "~/server/actions/fetchImages";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MotionDiv } from "~/components/ui/MotionDiv";

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
  const { ref, inView } = useInView();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status,error } =
    useInfiniteQuery({
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
            className="flex h-auto w-64 flex-col overflow-hidden text-ellipsis whitespace-nowrap"
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
