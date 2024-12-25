"use server";
import { getMyImages } from "~/server/queries";
import { deleteImage } from "../queries";
import { ImageType } from "~/lib/types";

export const fetchImages = async (page: number): Promise<ImageType[]> => {
  const offset = page * 20;
  return await getMyImages({ limit: 20, offset: offset });
};

export async function deleteImg(id: number) {
  try {
    await deleteImage(id);
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw new Error("Unable to delete image");
  }
}
