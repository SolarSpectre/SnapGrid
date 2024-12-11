import "server-only";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { images } from "./db/schema";
import { and,eq } from "drizzle-orm";
import analyticsServerClient from "./analytics";
interface GetMyImagesParams {
  limit: number;
  offset: number;
}
export async function getMyImages(params: GetMyImagesParams) {
  const {limit,offset} = params;
  const user = await auth();
  if (!user.userId) throw new Error("Unathorized");
  const images = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
    limit,
    offset,
  });
  return images;
}
export async function getImage(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unathorized");

  const image = await db.query.images.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
  if (!image) throw new Error("Image Not Found");
  if (image.userId !== user.userId) throw new Error("Unauthorized");

  return image;
}
export async function deleteImage(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");
  await db
    .delete(images)
    .where(and(eq(images.id, id), eq(images.userId, user.userId)));

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "delete image",
    properties:{
      imageId:id,
    }
  })
  redirect("/");
}
