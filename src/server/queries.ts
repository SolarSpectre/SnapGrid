import "server-only";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { albumImage, images } from "./db/schema";
import { and, eq } from "drizzle-orm";
import analyticsServerClient from "./analytics";
interface GetMyImagesParams {
  limit: number;
  offset: number;
}

interface AlbumImagesParams {
  limit: number;
  offset: number;
  id: number;
}
export async function getMyImages(params: GetMyImagesParams) {
  const { limit, offset } = params;
  const user = await auth();

  if (!user || !user.userId) {
    return [];
  }
  if (!user.userId) throw new Error("Unauthorized");
  const images = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
    limit,
    offset,
  });
  return images;
}
export async function getAlbums() {
  const user = await auth();
  if (!user.userId) throw new Error("Unathorized");
  const albums = await db.query.album.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });
  return albums;
}
export async function getAlbum(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unathorized");
  const album = await db.query.album.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
  if (!album) throw new Error("Album Not Found");

  if (album.userId !== user.userId) throw new Error("Unauthorized");
  return album;
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
    properties: {
      imageId: id,
    },
  });
  redirect("/");
}
export const getAllImagesByAlbumId = async (params: AlbumImagesParams) => {
  const { limit, offset, id } = params;
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");
  const albumImages = await db
    .select({
      id: images.id,
      name: images.name,
      url: images.url,
      userId: images.userId,
      createdAt: images.createdAt,
      updatedAt: images.updatedAt,
    })
    .from(albumImage)
    .innerJoin(images, eq(albumImage.imageId, images.id))
    .where(eq(albumImage.albumId, id))
    .limit(limit)
    .offset(offset);

  return albumImages;
};
export const addImagesToAlbum = async (params: {
  albumId: number;
  imageIds: number[];
}) => {
  const { albumId, imageIds } = params;
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  const albumImagesToInsert = imageIds.map((imageId) => ({
    albumId,
    imageId,
    userId: user.userId,
  }));

  await db.insert(albumImage).values(albumImagesToInsert);

  return { message: "Images added to the album successfully" };
};
export const addImageToAlbum = async (params: {
  albumId: number;
  imageId: number;
}) => {
  const { albumId, imageId } = params;
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized");
  const albumImageToInsert = {
    albumId,
    imageId,
    userId: user.userId,
  };
  await db.insert(albumImage).values(albumImageToInsert);

  return { message: "Image added to the album successfully" };
};
