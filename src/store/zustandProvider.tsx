"use client";

import { createStore, useStore } from "zustand";
import React, { createContext, useContext } from "react";

interface ImageStore {
  selectedImages: Set<number>;
  toggleImageSelection: (id: number) => void;
  clearSelection: () => void;
}

const createImageStore = () =>
  createStore<ImageStore>((set) => ({
    selectedImages: new Set(),
    toggleImageSelection: (id: number) =>
      set((state) => {
        const updatedSelection = new Set(state.selectedImages);
        if (updatedSelection.has(id)) {
          updatedSelection.delete(id);
        } else {
          updatedSelection.add(id);
        }
        return { selectedImages: updatedSelection };
      }),
    clearSelection: () => set({ selectedImages: new Set() }),
  }));

const ImageStoreContext = createContext<ReturnType<typeof createImageStore> | null>(null);

export const ImageStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store] = React.useState(() => createImageStore());
  return <ImageStoreContext.Provider value={store}>{children}</ImageStoreContext.Provider>;
};

const useImageStore = <T,>(selector: (state: ImageStore) => T) => {
  const store = useContext(ImageStoreContext);
  if (!store) {
    throw new Error("Missing ImageStoreProvider in the component tree");
  }
  return useStore(store, selector);
};

export const useSelectedImages = () => useImageStore((state) => state.selectedImages);
export const useToggleImageSelection = () => useImageStore((state) => state.toggleImageSelection);
export const useClearSelection = () => useImageStore((state) => state.clearSelection);

