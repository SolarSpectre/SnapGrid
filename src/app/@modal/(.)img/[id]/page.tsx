import { Modal } from "./modal";
import FullPageImage from "~/app/components/full-image-page";

type Params = Promise<{ id: string }>
export default async function PhotoModal({
  params,
}: {
  params: Params;
}) {
  const { id: photoId } = await params;
  const idAsNumber = Number(photoId);
  if (Number.isNaN(idAsNumber)) throw new Error("Invalid photo id");
  return (
    <Modal>
      <FullPageImage id={idAsNumber}/>
    </Modal>
  );
}
