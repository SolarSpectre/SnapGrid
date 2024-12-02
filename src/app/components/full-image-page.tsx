/* eslint-disable @next/next/no-img-element */
import { currentUser } from '@clerk/nextjs/server'
import { Button } from '~/components/ui/button';
import { deleteImage, getImage } from "~/server/queries";

export default async function FullPageImage(props: { id: number }) {
  const image = await getImage(props.id);
  const uploaderInfo =  await currentUser();
  if (!uploaderInfo) return <div>Not signed in</div>
  return (
    <div className="flex h-full w-full min-w-0">
      <div className="flex-shrink flex items-center justify-center">
        <img
          src={image.url}
          className="flex-shrink object-contain"
          alt={image.name}
        />
      </div>
      <div className="flex w-48 flex-shrink-0 flex-col border-l ">
        <div className="text-lg border-b text-center p-2">{image.name}</div>
        <div className="flex flex-col p-2">
          <span>Upload By: </span>
          <span>{`${uploaderInfo?.firstName} ${uploaderInfo?.lastName}`}</span>
        </div>
        <div className="flex flex-col p-2">
          <span>Created On: </span>
          <span>{new Date(image.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-col p-2">
          <form action={async ()=>{
            "use server";
            await deleteImage(props.id);
          }}>
            <Button type="submit" variant="destructive">Delete</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
