'use client';

import GalleryUploader, { type GalleryItem } from '../uploads/GalleryUploader';

export type { GalleryItem };

interface GalleryImagesManagerProps {
  images: GalleryItem[];
  onAddImages: (items: GalleryItem[]) => void;
  onRemoveImage: (key: string) => void;
  onReorder: (images: GalleryItem[]) => void;
  onError: (message: string) => void;
}

/** A project's gallery images, uploaded securely to Cloudinary via `GalleryUploader`. */
export default function GalleryImagesManager({
  images,
  onAddImages,
  onRemoveImage,
  onReorder,
  onError,
}: GalleryImagesManagerProps) {
  return (
    <GalleryUploader
      label="Gallery images"
      images={images}
      onAddImages={onAddImages}
      onRemoveImage={onRemoveImage}
      onReorder={onReorder}
      onError={onError}
      folder="projectGallery"
    />
  );
}
