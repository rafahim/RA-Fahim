'use client';

import { useEffect, useState } from 'react';
import { useAbout } from '../../hooks/useContent';
import { updateAbout } from '../../services/about.service';
import { ErrorState, EmptyState, Skeleton, Input, Textarea, Button, useToast } from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/env';
import { logError } from '../../utils/errors';
import CloudinaryUploader, { type CloudinaryImageValue } from '../components/uploads/CloudinaryUploader';

export default function AboutAdminPage() {
  const { data, loading, error, refetch } = useAbout();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [aboutHeading, setAboutHeading] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [profileImage, setProfileImage] = useState<CloudinaryImageValue | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync local edit state whenever fresh data arrives (initial load or refetch).
  useEffect(() => {
    if (!data) return;
    setName(data.name ?? '');
    setProfessionalTitle(data.professionalTitle ?? '');
    setExperience(data.experience ?? '');
    setAvailabilityStatus(data.availabilityStatus ?? '');
    setAboutHeading(data.aboutHeading ?? '');
    setAboutDescription(data.aboutDescription ?? '');
    setAdditionalInfo(data.additionalInfo ?? '');
    setProfileImage(
      data.profileImageUrl ? { url: data.profileImageUrl, publicId: data.profileImagePublicId } : null
    );
  }, [data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = await updateAbout({
      name: name.trim() || null,
      professional_title: professionalTitle.trim() || null,
      experience: experience.trim() || null,
      availability_status: availabilityStatus.trim() || null,
      about_heading: aboutHeading.trim() || null,
      about_description: aboutDescription.trim() || null,
      additional_info: additionalInfo.trim() || null,
      profile_image_url: profileImage?.url ?? null,
      profile_image_public_id: profileImage?.publicId ?? null,
    });

    setSaving(false);

    if (result.error) {
      logError('AboutAdminPage.save', result.error);
      showError(result.error.message);
      return;
    }

    showSuccess('About content updated.');
    refetch();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">About</h1>
      <p className="mb-8 text-sm text-white/50">
        Manage the name, title, bio, and profile photo shown on the public site.
      </p>

      {!isSupabaseConfigured() && (
        <EmptyState
          title="Supabase isn't configured"
          description="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load and edit About content."
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
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              id="name"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="RA Fahim"
            />

            <Input
              id="experience"
              label="Experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="5+ years"
            />
          </div>

          <Input
            id="professionalTitle"
            label="Professional title"
            value={professionalTitle}
            onChange={(e) => setProfessionalTitle(e.target.value)}
            placeholder="A 3D creator driven by crafting striking and unforgettable projects"
          />

          <Input
            id="availabilityStatus"
            label="Hero availability badge"
            value={availabilityStatus}
            onChange={(e) => setAvailabilityStatus(e.target.value)}
            placeholder="Available for new projects — 3D Creator"
          />

          <div className="border-t border-white/10 pt-6">
            <Input
              id="aboutHeading"
              label="About heading"
              value={aboutHeading}
              onChange={(e) => setAboutHeading(e.target.value)}
              placeholder="About me"
            />

            <Textarea
              id="aboutDescription"
              label="About description"
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              rows={6}
              className="mt-6"
              placeholder="A longer bio shown on the About section."
            />
          </div>

          <Textarea
            id="additionalInfo"
            label="Additional information"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
            placeholder="Anything else worth mentioning (optional)."
          />

          <CloudinaryUploader
            label="Profile / hero image"
            value={profileImage}
            onChange={setProfileImage}
            onError={showError}
            folder="profile"
            previewClassName="aspect-[3/4] w-52 rounded-xl"
            containerClassName="w-52"
            helperText="Tall portrait shown on the homepage, JPG/PNG/WEBP, up to 8MB."
          />

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
