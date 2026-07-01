import { create } from 'zustand'
import { GalleryItem } from '../types/comfy'

interface GalleryState {
  images: GalleryItem[]
  addImage: (image: GalleryItem) => void
  setImages: (images: GalleryItem[]) => void
}

export const useGalleryStore = create<GalleryState>((set) => ({
  images: [],
  addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
  setImages: (images) => set({ images }),
}))
