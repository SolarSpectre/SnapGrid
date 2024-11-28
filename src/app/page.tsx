import { SignedIn, SignedOut} from "@clerk/nextjs";
import { getMyImages } from "~/server/queries";
export const dynamic = "force-dynamic";
const Images = async () => { 
  const images = getMyImages()
  return (
    <div className="flex flex-wrap gap-4">
      {[images].map((image, index) => (
        <div key={image.id + "-" + index} className="flex w-48 flex-col">
          <img src={image.url} />
          <div>{image.name}</div>
        </div>
      ))}
    </div>
  );
};
export default async function HomePage() {
  return (
    <main className="">
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please Sign In above
        </div>
      </SignedOut>
      <SignedIn>
        <Images />
      </SignedIn>
    </main>
  );
}
