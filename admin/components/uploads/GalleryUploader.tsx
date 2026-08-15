'use client';

import { useRef, useState } from 'react';
import { ImagePlus, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  uploadImage,
  deleteImage,
  ACCEPTED_IMAGE_EXTENSIONS,
  DEFAULT_MAX_FILE_SIZE_MB,
  type CloudinaryFolderKey,
} from '../../../utils/cloudinary';
import { isCloudinaryConfigured } from '../../../lib/env';
import { Input, Button } from '../../../components/ui';
import { logError } from '../../../utils/errors';
import ImagePreview from './ImagePreview';

export interface GalleryItem {
  /** Stable client-side key (existing DB id for saved images, a temp id for unsaved ones). */
  key: string;
  /** Present only for images that already exist in the database. */
  id?: string;
  imageUrl: string;
  cloudinaryPublicId: string | null;
  displayOrder: number;
}

interface UploadingFile {
  tempKey: string;
  progress: number;
}

interface GalleryUploaderProps {
  label: string;
  images: GalleryItem[];
  onAddImages: (items: GalleryItem[]) => void;
  onRemoveImage: (key: string) => void;
  onReorder: (images: GalleryItem[]) => void;
  folder: CloudinaryFolderKey;
  onError: (message: string) => void;
  maxSizeMB?: number;
  maxFiles?: number;
}

/**
 * Reusable multi-image gallery manager backed by secure signed Cloudinary
 * uploads. Supports selecting multiple files at once (each tracked with
 * its own progress), removing (deletes the Cloudinary asset immediately),
 * and reordering via left/right move buttons — no drag-and-drop
 * dependency. Fully controlled: the parent owns the array and decides
 * what to persist on submit.
 */
export default function GalleryUploader({
  label,
  images,
  onAddImages,
  onRemoveImage,
  onReorder,
  folder,
  onError,
  maxSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  maxFiles,
}: GalleryUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [manualUrl, setManualUrl] = useState('');
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cloudinaryReady = isCloudinaryConfigured();

  const atCapacity = typeof maxFiles === 'number' && images.length >= maxFiles;

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    let files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    if (typeof maxFiles === 'number') {
      const remaining = Math.max(0, maxFiles - images.length);
      if (files.length > remaining) {
        onError(`You can add up to ${maxFiles} images (${remaining} remaining).`);
        files = files.slice(0, remaining);
      }
      if (files.length === 0) return;
    }

    const startingOrder = images.length;
    let lastError: string | null = null;

    await Promise.all(
      files.map(async (file, index) => {
        const tempKey = `uploading-${crypto.randomUUID()}`;
        setUploadingFiles((prev) => [...prev, { tempKey, progress: 0 }]);

        const result = await uploadImage(file, folder, {
          maxSizeMB,
          onProgress: (percent) =>
            setUploadingFiles((prev) =>
              prev.map((f) => (f.tempKey === tempKey ? { ...f, progress: percent } : f))
            ),
        });

        setUploadingFiles((prev) => prev.filter((f) => f.tempKey !== tempKey));

        if (result.error) {
          lastError = result.error.message;
          return;
        }

        onAddImages([
          {
            key: `new-${crypto.randomUUID()}`,
            imageUrl: result.data.secureUrl,
            cloudinaryPublicId: result.data.publicId,
            displayOrder: startingOrder + index,
          },
        ]);
      })
    );

    if (lastError) {
      logError('GalleryUploader.upload', lastError);
      onError(lastError);
    }
  }

  function handleAddManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    onAddImages([
      {
        key: `new-${crypto.randomUUID()}`,
        imageUrl: url,
        cloudinaryPublicId: null,
        displayOrder: images.length,
      },
    ]);
    setManualUrl('');
  }

  async function handleRemove(item: GalleryItem) {
    if (item.cloudinaryPublicId) {
      setRemovingKey(item.key);
      const result = await deleteImage(item.cloudinaryPublicId);
      setRemovingKey(null);
      if (result.error) {
        logError('GalleryUploader.remove', result.error);
        onError(result.error.message);
        return;
      }
    }
    onRemoveImage(item.key);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onReorder(next.map((item, i) => ({ ...item, displayOrder: i })));
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs uppercase tracking-widest text-white/50">{label}</label>

      {(images.length > 0 || uploadingFiles.length > 0) && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.key} className="group relative">
              <ImagePreview
                src={image.imageUrl}
                alt={`Gallery image ${index + 1}`}
                className="aspect-square rounded-xl"
                uploading={removingKey === image.key}
                onRemove={() => handleRemove(image)}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-1.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move image earlier"
                  className="pointer-events-auto rounded-full bg-black/60 p-1 text-white/80 opacity-0 transition-opacity hover:text-white disabled:cursor-not-allowed disabled:opacity-0 group-hover:opacity-100"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label="Move image later"
                  className="pointer-events-auto rounded-full bg-black/60 p-1 text-white/80 opacity-0 transition-opacity hover:text-white disabled:cursor-not-allowed disabled:opacity-0 group-hover:opacity-100"
                >
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/70">
                {index + 1}
              </span>
            </li>
          ))}

          {uploadingFiles.map((f) => (
            <li
              key={f.tempKey}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/60"
            >
              <div className="h-1 w-2/3 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#8B7CF6] transition-[width] duration-150"
                  style={{ width: `${f.progress}%` }}
                />
              </div>
              <span className="text-[10px]">{f.progress}%</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => cloudinaryReady && !atCapacity && inputRef.current?.click()}
          disabled={!cloudinaryReady || atCapacity}
          className="flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2.5 text-xs text-white/50 transition-colors hover:border-white/35 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
          {atCapacity ? `Limit reached (${maxFiles})` : 'Add images'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
      </div>

      {!cloudinaryReady && (
        <div className="flex max-w-md items-center gap-2">
          <Input
            type="url"
            placeholder="https://… (paste an image URL)"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={handleAddManualUrl}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
