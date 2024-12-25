import { currentUser } from "@clerk/nextjs/server";
import PhotoAlbumProvider from "~/app/components/albumQueryProvider";
import { getCollaborators } from "~/server/actions/albumActions";
import { getFriends } from "~/server/actions/friendActions";
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

  const collaborators = await getCollaborators(idAsNumber);
  const friends = await getFriends(uploaderInfo!.id);
  if (!uploaderInfo) {
    return <div>Not signed in</div>;
  }

  return (
    <PhotoAlbumProvider
      album={album}
      collaborators={collaborators}
      friends={friends.filter((f) => f.status === "accepted")}
    />
  );
}
