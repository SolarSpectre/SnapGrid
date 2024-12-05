import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { getMyImages } from "~/server/queries";
import LoadMore from "./_components/load-more";
import { MotionDiv } from "~/components/ui/MotionDiv";
export const dynamic = "force-dynamic";

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const Images = async () => {
  const images = await getMyImages({ limit: 20, offset: 0 });
  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {images.map((image, index) => (
        <MotionDiv
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.25, ease: "easeInOut", duration: 0.5 }}
          viewport={{ amount: 0 }}
          key={image.id}
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
  );
};
export default function HomePage() {
  return (
    <main className="">
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please Sign In above
        </div>
      </SignedOut>
      <SignedIn>
        <Images />
        <LoadMore />
      </SignedIn>
    </main>
  );
}
