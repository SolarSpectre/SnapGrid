import Image from "next/image";
import { getImage } from "~/server/queries";

export default async function FullPageImage(props:{id:number}) {
  const image = await getImage(props.id);
  return (
      <Image
        src={image.url}
        style={{ objectFit: "contain" }}
        width={384}
        height={384}
        alt={image.name}
      />
  );
}
