import db from "../server/db/index.ts";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  const images = await db.query.images.findMany(
    orderBy: (model, {desc}) => desc(model.id)
  );
    return (
    <main className="">
      <div className="flex flex-wrap gap-4">
                {
        [...images,...images,...images].map((image, index)=>(
        <div key={image.id + "-" + index} className="flex flex-col w-48">
          <img src={image.url}/>
          <div>{image.name}</div>
        </div>
        ))
      }</div>
    </main>
  );
}
