"use server";
import { db } from "../db";
import { album } from "../db/schema";

type props={
    name:string,
    description:string,
    id:string,
}
export async function createAlbum(props:props) {
  await db.insert(album).values({
    name: props.name,
    description: props.description,
    userId: props.id,
  });
}
