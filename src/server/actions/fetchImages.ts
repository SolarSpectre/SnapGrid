"use server";
import { getMyImages } from "~/server/queries";

// Define the type for an image object
type ImageType = {
  id: number;
  name: string;
  url: string;
  userId:string
  createdAt: Date; 
  updatedAt: Date | null;
};

export const fetchImages = async (page: number): Promise<ImageType[]> => {
  const offset = page * 20;
  return await getMyImages({ limit: 20, offset: offset });
};
