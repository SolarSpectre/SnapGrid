"use server";
import { number } from "zod";
import { db } from "../db";
import { album } from "../db/schema";
import {
  addImagesToAlbum,
  addImageToAlbum,
  getAlbums,
  getAllImagesByAlbumId,
} from "../queries";
import { ImageType } from "~/lib/types";

type props = {
  name: string;
  description: string;
  id: string;
};
export async function createAlbum(props: props) {
  await db.insert(album).values({
    name: props.name,
    description: props.description,
    userId: props.id,
  });
}
export async function fetchAlbumServer() {
  return await getAlbums();
}
export const fetchAlbumImages = async (
  page: number,
  id: number,
): Promise<ImageType[]> => {
  const offset = page * 20;
  return await getAllImagesByAlbumId({ limit: 20, offset: offset, id: id });
};
type params = {
  albumId: number;
  imageIds: number[];
};
type singleImgParams = {
  albumId: number;
  imageId: number;
};
export const addImagesAlbum = async (params: params) => {
  const message = await addImagesToAlbum(params);
  return message;
};
export const addImageAlbum = async (params: singleImgParams) => {
  const message = await addImageToAlbum(params);
  return message;
};
