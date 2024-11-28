import Image from "next/image";
import { getImage } from "~/server/queries";

export default async function PhotoModal({
  params,
}: {
  params: { id: string };
}) {
  const { id: photoId } = await params;
  const idAsNumber = Number(photoId);
  if (Number.isNaN(idAsNumber)) throw new Error("Invalid photo id");
  const image = await getImage(idAsNumber);
  return (
    <div>
      <Image
        src={image.url}
        style={{ objectFit: "contain" }}
        width={192}
        height={192}
        alt={image.name}
      />
    </div>
  );
}
