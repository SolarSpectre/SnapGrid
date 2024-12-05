"use client";
import LoadingSpinnerSVG from "~/components/ui/spinner";
import Image from "next/image";
import Link from "next/link";
import { fetchImages } from "~/server/actions/fetchImages";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
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
type ImagesProps = {
  images: ImageType[];
};
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const Images: React.FC<ImagesProps> = ({ images }) => {

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {images.map((image,index) => (
        <MotionDiv
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index*0.25, ease: "easeInOut", duration: 0.5 }}
          viewport={{ amount: 0 }}
          key={image.id}
          className="flex h-auto w-64 flex-col overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <Link href={`/img/${image.id}`}>
            <Image
              src={image.url}
              style={{ objectFit: "cover" }}
              width={250}
              height={250}
              alt={image.name}
              className="aspect-4/5 rounded-lg"
            />
          </Link>
          <p>{image.name}</p>
        </MotionDiv>
      ))}
    </div>
  );
};

function LoadMore() {
  const { ref, inView } = useInView();
  const [images, setImages] = useState<ImageType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMoreImages, setHasMoreImages] = useState(true);

  useEffect(() => {
    const loadMoreImages = async (): Promise<void> => {
      try {
        if (inView && hasMoreImages) {
          const newImages = await fetchImages(page);
          if (newImages.length > 0) {
            setImages((prevImages) => [...prevImages, ...newImages]);
            setPage((prevPage) => prevPage + 1);
          } else {
            setHasMoreImages(false);
          }
        }
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    void loadMoreImages();
  }, [inView, page, hasMoreImages]);

  return (
    <>
      <Images images={images} />
      {hasMoreImages && (
        <section className="flex w-full items-center justify-center">
          <div ref={ref}>
            <LoadingSpinnerSVG />
          </div>
        </section>
      )}
    </>
  );
}

export default LoadMore;
