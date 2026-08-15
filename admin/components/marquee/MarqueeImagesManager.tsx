'use client';

import GalleryUploader, { type GalleryItem } from '../uploads/GalleryUploader';

export type { GalleryItem };

interface MarqueeImagesManagerProps {
  images: GalleryItem[];
  onAddImages: (items: GalleryItem[]) => void;
  onRemoveImage: (key: string) => void;
  onReorder: (images: GalleryItem[]) => void;
  onError: (message: string) => void;
}

/** The Hero section's scrolling image strip, uploaded securely to Cloudinary via `GalleryUploader`. */
export default function MarqueeImagesManager({
  images,
  onAddImages,
  onRemoveImage,
  onReorder,
  onError,
}: MarqueeImagesManagerProps) {
  return (
    <GalleryUploader
      label="Marquee images"
      images={images}
      onAddImages={onAddImages}
      onRemoveImage={onRemoveImage}
      onReorder={onReorder}
      onError={onError}
      folder="marquee"
    />
  );
}
