'use client';

import { useEffect, useState } from 'react';
import { useWebsiteSettings } from '../../hooks/useContent';
import { updateWebsiteSettings } from '../../services/website.service';
import { ErrorState, EmptyState, Skeleton, Input, Textarea, Button, useToast } from '../../components/ui';
import { isCloudinaryConfigured, isSupabaseConfigured } from '../../lib/env';
import { logError } from '../../utils/errors';
import CloudinaryUploader, { type CloudinaryImageValue } from '../components/uploads/CloudinaryUploader';

export default function SettingsAdminPage() {
  const { data, loading, error, refetch } = useWebsiteSettings();
  const { showSuccess, showError } = useToast();

  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteDescription, setWebsiteDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [logo, setLogo] = useState<CloudinaryImageValue | null>(null);
  const [favicon, setFavicon] = useState<CloudinaryImageValue | null>(null);
  const [ogImage, setOgImage] = useState<CloudinaryImageValue | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setWebsiteTitle(data.websiteTitle ?? '');
    setWebsiteDescription(data.websiteDescription ?? '');
    setSeoTitle(data.seoTitle ?? '');
    setSeoDescription(data.seoDescription ?? '');
    setLogo(data.logoUrl ? { url: data.logoUrl, publicId: data.logoPublicId } : null);
    setFavicon(data.faviconUrl ? { url: data.faviconUrl, publicId: data.faviconPublicId } : null);
    setOgImage(data.ogImageUrl ? { url: data.ogImageUrl, publicId: data.ogImagePublicId } : null);
  }, [data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = await updateWebsiteSettings({
      website_title: websiteTitle.trim() || null,
      website_description: websiteDescription.trim() || null,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      logo_url: logo?.url ?? null,
      logo_public_id: logo?.publicId ?? null,
      favicon_url: favicon?.url ?? null,
      favicon_public_id: favicon?.publicId ?? null,
      og_image_url: ogImage?.url ?? null,
      og_image_public_id: ogImage?.publicId ?? null,
    });

    setSaving(false);

    if (result.error) {
      logError('SettingsAdminPage.save', result.error);
      showError(result.error.message);
      return;
    }

    showSuccess('Settings updated.');
    refetch();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">Settings</h1>
      <p className="mb-8 text-sm text-white/50">
        Site-wide title, SEO, and branding — logo, favicon, and the Open Graph image used when the
        site is shared.
      </p>

      <div className="mb-8 flex flex-col gap-3 sm:max-w-md">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          <span>Supabase</span>
          <span className={isSupabaseConfigured() ? 'text-green-400' : 'text-yellow-400'}>
            {isSupabaseConfigured() ? 'Connected' : 'Not configured'}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          <span>Cloudinary</span>
          <span className={isCloudinaryConfigured() ? 'text-green-400' : 'text-yellow-400'}>
            {isCloudinaryConfigured() ? 'Connected' : 'Not configured'}
          </span>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <EmptyState
          title="Supabase isn't configured"
          description="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load and edit website settings."
        />
      )}

      {isSupabaseConfigured() && loading && (
        <div className="max-w-2xl rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="mt-3 h-4 w-1/3" />
          <Skeleton className="mt-5 h-20 w-full" />
        </div>
      )}

      {isSupabaseConfigured() && !loading && error && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {isSupabaseConfigured() && !loading && !error && data && (
        <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
          <Input
            id="websiteTitle"
            label="Website title"
            value={websiteTitle}
            onChange={(e) => setWebsiteTitle(e.target.value)}
            placeholder="RA Fahim — 3D Creator"
          />

          <Textarea
            id="websiteDescription"
            label="Website description"
            value={websiteDescription}
            onChange={(e) => setWebsiteDescription(e.target.value)}
            rows={2}
            placeholder="Shown in browser previews and some search results."
          />

          <Input
            id="seoTitle"
            label="SEO title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Overrides the website title for search engines, if set."
          />

          <Textarea
            id="seoDescription"
            label="SEO description"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={2}
            placeholder="Meta description used for search engines."
          />

          <div className="flex flex-wrap gap-6">
            <CloudinaryUploader
              label="Logo"
              value={logo}
              onChange={setLogo}
              onError={showError}
              folder="logo"
              previewClassName="aspect-square w-28 rounded-xl bg-white/5"
              containerClassName="w-28"
              helperText="Square, transparent PNG recommended."
            />

            <CloudinaryUploader
              label="Favicon"
              value={favicon}
              onChange={setFavicon}
              onError={showError}
              folder="favicon"
              previewClassName="aspect-square w-20 rounded-lg bg-white/5"
              containerClassName="w-20"
              helperText="512×512 PNG recommended."
              maxSizeMB={2}
            />

            <CloudinaryUploader
              label="Open Graph image"
              value={ogImage}
              onChange={setOgImage}
              onError={showError}
              folder="og"
              previewClassName="aspect-[1200/630] w-64 rounded-xl"
              containerClassName="w-64"
              helperText="1200×630 recommended, shown on social link previews."
            />
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-6">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
