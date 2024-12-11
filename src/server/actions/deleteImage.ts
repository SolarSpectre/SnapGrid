"use server";

import { deleteImage } from "../queries";


export async function deleteImg(id: number) {
  try {
    await deleteImage(id);
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw new Error("Unable to delete image");
  }
}
