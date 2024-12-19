import { currentUser } from "@clerk/nextjs/server";
import PhotoAlbumProvider from "~/app/components/albumQueryProvider";
import { getAlbum } from "~/server/queries";

type Params = {
  id: string;
};


export default async function PhotoAlbumServer({ params }: { params: Params }) {
  const albumId = Number(params.id);

  if (Number.isNaN(albumId)) {
    throw new Error("Invalid album id");
  }

  const album = await getAlbum(albumId);
  const uploaderInfo = await currentUser();

  if (!uploaderInfo) {
    return <div>Not signed in</div>;
  }

  return <PhotoAlbumProvider album={album} />;
}