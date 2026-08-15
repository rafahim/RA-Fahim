'use client';

import { useMemo, useState } from 'react';
import { useMarqueeImages } from '../../hooks/useContent';
import {
  createMarqueeImage,
  deleteMarqueeImage,
  updateMarqueeImage,
} from '../../services/marquee.service';
import { Spinner, ErrorState, EmptyState, useToast } from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/env';
import { logError } from '../../utils/errors';
import MarqueeImagesManager, { type GalleryItem } from '../components/marquee/MarqueeImagesManager';

/**
 * Manages the scrolling image strip shown just below the Hero section
 * (`MarqueeSection`). Unlike Projects/Services there's no draft state and
 * no separate form modal — every add/remove/reorder here is persisted to
 * `marquee_images` immediately (Cloudinary upload/delete already happens
 * inside `GalleryUploader`/`MarqueeImagesManager`; this page only syncs
 * the corresponding database rows).
 */
export default function MarqueeAdminPage() {
  const { data, loading, error, refetch } = useMarqueeImages();
  const { showError } = useToast();
  const [saving, setSaving] = useState(false);

  const images: GalleryItem[] = useMemo(
    () =>
      (data ?? [])
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((img) => ({
          key: img.id,
          id: img.id,
          imageUrl: img.imageUrl,
          cloudinaryPublicId: img.cloudinaryPublicId,
          displayOrder: img.displayOrder,
        })),
    [data]
  );

  async function handleAddImages(items: GalleryItem[]) {
    setSaving(true);
    const results = await Promise.all(
      items.map((item) =>
        createMarqueeImage({
          image_url: item.imageUrl,
          cloudinary_public_id: item.cloudinaryPublicId,
          display_order: item.displayOrder,
        })
      )
    );
    setSaving(false);

    const failed = results.find((r) => r.error);
    if (failed?.error) {
      logError('MarqueeAdminPage.add', failed.error);
      showError(failed.error.message);
    }
    refetch();
  }

  async function handleRemoveImage(key: string) {
    // The Cloudinary asset (if any) is already deleted inside
    // `GalleryUploader` before this fires — this only removes the DB row.
    setSaving(true);
    const result = await deleteMarqueeImage(key);
    setSaving(false);

    if (result.error) {
      logError('MarqueeAdminPage.remove', result.error);
      showError(result.error.message);
      return;
    }
    refetch();
  }

  async function handleReorder(reordered: GalleryItem[]) {
    setSaving(true);
    const results = await Promise.all(
      reordered.map((item) =>
        item.id ? updateMarqueeImage(item.id, { display_order: item.displayOrder }) : null
      )
    );
    setSaving(false);

    const failed = results.find((r) => r?.error);
    if (failed?.error) {
      logError('MarqueeAdminPage.reorder', failed.error);
      showError(failed.error.message);
    }
    refetch();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-medium">Marquee</h1>
        <p className="text-sm text-white/50">
          Manage the scrolling image strip shown just below the Hero section. There&apos;s no
          publish step — every image here is live on the site, in this order. Removing every
          image hides the strip entirely.
        </p>
      </div>

      {!isSupabaseConfigured() && (
        <EmptyState
          title="Supabase isn't configured"
          description="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to manage the marquee strip."
        />
      )}

      {isSupabaseConfigured() && (
        <>
          {loading && <Spinner label="Loading marquee images..." className="py-12" />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <MarqueeImagesManager
                images={images}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                onReorder={handleReorder}
                onError={showError}
              />
              {saving && <p className="mt-3 text-xs text-white/40">Saving…</p>}
              {images.length === 0 && (
                <p className="mt-3 text-xs text-white/40">
                  No marquee images — the strip is currently hidden on the live site.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
