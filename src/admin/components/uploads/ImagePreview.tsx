import { Loader2, RefreshCw, X } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  /** Tailwind aspect/shape classes, e.g. 'aspect-video rounded-xl' or 'aspect-square rounded-full'. */
  className?: string;
  uploading?: boolean;
  /** 0–100. Omit (or leave undefined) to show an indeterminate spinner instead of a bar. */
  progress?: number;
  onReplace?: () => void;
  onRemove?: () => void;
  replaceLabel?: string;
}

/**
 * Reusable preview tile for an uploaded (or uploading) image. Used by
 * `CloudinaryUploader` and `GalleryUploader` so every image field in the
 * admin panel — profile photo, hero, featured image, logo, favicon, OG
 * image, gallery tiles — looks and behaves the same.
 */
export default function ImagePreview({
  src,
  alt,
  className = 'aspect-video rounded-xl',
  uploading = false,
  progress,
  onReplace,
  onRemove,
  replaceLabel = 'Replace image',
}: ImagePreviewProps) {
  return (
    <div className={`group relative w-full overflow-hidden border border-white/10 ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />

      {uploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-white">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          {typeof progress === 'number' ? (
            <div className="flex w-2/3 flex-col items-center gap-1">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#29ABE2] transition-[width] duration-150"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <span className="text-[10px] text-white/70">{Math.round(progress)}%</span>
            </div>
          ) : (
            <span className="text-[10px] text-white/70">Uploading…</span>
          )}
        </div>
      )}

      {!uploading && (onReplace || onRemove) && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/50 group-hover:opacity-100">
          {onReplace && (
            <button
              type="button"
              onClick={onReplace}
              aria-label={replaceLabel}
              className="rounded-full bg-black/60 p-2 text-white/80 hover:bg-[#0077C2] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove image"
              className="rounded-full bg-black/60 p-2 text-white/80 hover:bg-red-500/70 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
