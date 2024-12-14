"use server";

import { getAlbums } from "../queries";

export async function fetchAlbumServer() {
    return await getAlbums()
  }