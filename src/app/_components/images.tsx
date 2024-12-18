import Image from "next/image";
import { MoreOptionsMenu } from "./options-menu";
import Link from "next/link";
import { MotionDiv } from "~/components/ui/MotionDiv";
import { CheckCircle } from "~/components/ui/SVG";
import { useSelectedImages, useToggleImageSelection } from "~/store/zustandProvider";
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
type ImageProps = {
  images: ImageType[];
};
export const Images: React.FC<ImageProps>=({images})=>{
const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

  const toggleImageSelection = useToggleImageSelection();
  const selectedImages = useSelectedImages();
  const handleSelectClick = (id: number) => {
    toggleImageSelection(id);
  };
    const getRandomDelay = () => Math.random() * (0.5 - 0.1) + 0.1;
    return (
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
    )
}