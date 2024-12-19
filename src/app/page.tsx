import { SignedIn, SignedOut } from "@clerk/nextjs";
import { fetchImages } from "~/server/actions/imagesActions";
import ClientOnly from "./_components/client";
export const dynamic = "force-dynamic";

const fetchInitialImages = async () => {
  const initialImages = await fetchImages(0); 
  return initialImages ?? [];
};


export default async function HomePage() {
  const initialImages = await fetchInitialImages();
  
  return (
    <main className="">
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please Sign In above
        </div>
      </SignedOut>
      <SignedIn>
        <ClientOnly initialImages={initialImages}/>
      </SignedIn>
    </main>
  );
}
