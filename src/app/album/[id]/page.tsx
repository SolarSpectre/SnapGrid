import { currentUser } from "@clerk/nextjs/server";
import PhotoAlbumProvider from "~/app/components/albumQueryProvider";
import { getAlbum } from "~/server/queries";

type Params = Promise<{ id: string }>;
export default async function PhotoAlbumServer({ params }: { params: Params }) {
  const { id: albumId } = await params;
  const idAsNumber = Number(albumId);

  if (Number.isNaN(idAsNumber)) {
    throw new Error("Invalid album id");
  }

  const album = await getAlbum(idAsNumber);
  const uploaderInfo = await currentUser();

  if (!uploaderInfo) {
    return <div>Not signed in</div>;
  }

  return <PhotoAlbumProvider album={album} />;
}
