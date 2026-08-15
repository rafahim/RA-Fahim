'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import {
  uploadImage,
  deleteImage,
  ACCEPTED_IMAGE_EXTENSIONS,
  DEFAULT_MAX_FILE_SIZE_MB,
  type CloudinaryFolderKey,
} from '../../../utils/cloudinary';
import { isCloudinaryConfigured } from '../../../lib/env';
import { Input } from '../../../components/ui';
import { logError } from '../../../utils/errors';
import ImagePreview from './ImagePreview';

export interface CloudinaryImageValue {
  url: string;
  publicId: string | null;
}

interface CloudinaryUploaderProps {
  label: string;
  value: CloudinaryImageValue | null;
  onChange: (value: CloudinaryImageValue | null) => void;
  /** Which Cloudinary folder this field uploads into (see `CLOUDINARY_FOLDERS`). */
  folder: CloudinaryFolderKey;
  onError: (message: string) => void;
  helperText?: string;
  maxSizeMB?: number;
  /** Tailwind classes controlling the preview tile's shape/aspect ratio. */
  previewClassName?: string;
  /** Tailwind classes controlling the max width of the whole field. */
  containerClassName?: string;
}

/**
 * Reusable single-image upload field backed by secure signed Cloudinary
 * uploads. Handles validation, progress, preview, replacing (uploads the
 * new file, then deletes the old asset), and removing (deletes the
 * asset). Falls back to a plain URL input when Cloudinary isn't
 * configured, so the surrounding form still works in that environment.
 *
 * This is the single building block reused for every image field in the
 * CMS: profile photo, hero image, project featured image, logo,
 * favicon, and Open Graph image.
 */
export default function CloudinaryUploader({
  label,
  value,
  onChange,
  folder,
  onError,
  helperText,
  maxSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  previewClassName = 'aspect-video rounded-xl',
  containerClassName = 'max-w-xs',
}: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cloudinaryReady = isCloudinaryConfigured();

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);

    const result = await uploadImage(file, folder, {
      maxSizeMB,
      onProgress: setProgress,
    });

    setUploading(false);

    if (result.error) {
      logError('CloudinaryUploader.upload', result.error);
      onError(result.error.message);
      return;
    }

    const previous = value;
    onChange({ url: result.data.secureUrl, publicId: result.data.publicId });

    // Best-effort cleanup of the asset being replaced — failure here
    // shouldn't block the user, just leaves an orphaned asset to clean
    // up later, so we log it rather than surfacing an error toast.
    if (previous?.publicId) {
      const deleteResult = await deleteImage(previous.publicId);
      if (deleteResult.error) logError('CloudinaryUploader.cleanupPrevious', deleteResult.error);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await handleFile(file);
  }

  async function handleRemove() {
    if (value?.publicId) {
      const result = await deleteImage(value.publicId);
      if (result.error) {
        logError('CloudinaryUploader.remove', result.error);
        onError(result.error.message);
        return;
      }
    }
    onChange(null);
  }

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      <label className="text-xs uppercase tracking-widest text-white/50">{label}</label>

      {value?.url ? (
        <ImagePreview
          src={value.url}
          alt={label}
          className={previewClassName}
          uploading={uploading}
          progress={uploading ? progress : undefined}
          onReplace={() => cloudinaryReady && inputRef.current?.click()}
          onRemove={handleRemove}
        />
      ) : (
        <button
          type="button"
          onClick={() => cloudinaryReady && inputRef.current?.click()}
          disabled={uploading || !cloudinaryReady}
          className={`flex w-full flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-white/[0.02] text-white/40 transition-colors hover:border-white/35 hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-50 ${previewClassName}`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="h-5 w-5" aria-hidden />
          )}
          <span className="text-xs">{uploading ? `Uploading… ${progress}%` : 'Upload image'}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_EXTENSIONS}
        className="hidden"
        onChange={handleFileChange}
      />

      {helperText && !uploading && <p className="text-xs text-white/30">{helperText}</p>}

      {!cloudinaryReady && (
        <>
          <Input
            type="url"
            placeholder="https://…"
            value={value?.url ?? ''}
            onChange={(e) => onChange(e.target.value ? { url: e.target.value, publicId: null } : null)}
          />
          <p className="text-xs text-white/30">
            Cloudinary isn&apos;t configured — paste an image URL directly instead.
          </p>
        </>
      )}
    </div>
  );
}
