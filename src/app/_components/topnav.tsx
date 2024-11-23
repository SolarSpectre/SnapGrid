"use client";
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import {useRouter} from 'next/navigation'
import { UploadButton } from "~/utils/uploadthing";
export default function TopNav() {
  const router = useRouter()
  return(
  <nav className="flex items-center justify-between w-full p-4 text-xl font-semibold border-b">
      <div>Gallery</div>
      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          router.refresh()
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
          <UserButton />
      </SignedIn>
      </div>
    </nav>
  )
}

