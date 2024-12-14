"use client";
import { CheckCircle, LoadingSpinnerSVG } from "~/components/ui/SVG";
import Image from "next/image";
import Link from "next/link";
import { fetchImages } from "~/server/actions/fetchImages";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { MotionDiv } from "~/components/ui/MotionDiv";
import {
  useSelectedImages,
  useToggleImageSelection,
} from "~/store/zustandProvider";
import { MoreOptionsMenu } from "./options-menu";
import { UploadDropzone } from "~/utils/uploadthing";
import posthog from "posthog-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "./album";
import { Button } from "~/components/ui/button";
import { fetchAlbumServer } from "~/server/actions/fetchAlbums";
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
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const fetchAlbums = async () => {
  const albums = await fetchAlbumServer();
  return albums;
};
const LoadMore: React.FC<LoadMoreClientProps> = ({ initialImages }) => {
  const selectedImages = useSelectedImages();
  const toggleImageSelection = useToggleImageSelection();

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
  const getRandomDelay = () => Math.random() * (0.5 - 0.1) + 0.1;
  const handleSelectClick = (id: number) => {
    toggleImageSelection(id);
  };

  const router = useRouter();

  const { data: albumData } = useQuery({
    queryKey: ["albums"],
    queryFn: fetchAlbums,
  });
  return (
    <>
      {initialImages.length === 0 ? (
        <UploadDropzone
          endpoint={"imageUploader"}
          onClientUploadComplete={(res) => {
            toast.dismiss("upload-begin");
            toast(<span className="text-lg">Upload Complete!</span>);
            router.refresh();
          }}
          onUploadError={(error: Error) => {
            posthog.capture("upload error:", { error });
            toast.dismiss("upload-begin");
            toast.error("Upload Failed");
          }}
          onUploadBegin={(res) => {
            posthog.capture("upload-begin");
            toast(
              <div className="flex items-center gap-2 text-white">
                <LoadingSpinnerSVG />
                <span className="text-lg">Uploading...</span>
              </div>,
              {
                duration: 100000,
                id: "upload-begin",
              },
            );
          }}
        />
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
                  <div className="absolute inset-0 rounded-lg bg-black bg-opacity-30 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </Link>
                {selectedImages.has(image.id) ? (
                  <>
                    <label
                      onClick={() => handleSelectClick(image.id)}
                      className="absolute right-16 top-0 opacity-100 transition"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-500">
                        <CheckCircle />
                      </div>
                    </label>
                    <label className="absolute bottom-7 right-16 opacity-100 transition">
                      <MoreOptionsMenu id={image.id} />
                    </label>
                  </>
                ) : (
                  <div className="absolute bottom-7 right-16 opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreOptionsMenu id={image.id} />
                  </div>
                )}
                <p>{image.name}</p>
              </MotionDiv>
            ))}
          </div>
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
