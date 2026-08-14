-- ============================================================================
-- Cloudinary image fields
-- ============================================================================
-- Adds the columns needed to store Cloudinary `public_id`s (required to
-- delete/replace assets server-side) alongside the existing `secure_url`
-- columns, plus the previously-missing hero image on `about`.
--
-- projects.featured_image already stores the Cloudinary secure_url; this
-- adds the matching public_id so the featured image can be replaced/deleted
-- through the Cloudinary Admin API without a lookup.
-- ============================================================================

alter table public.projects
  add column if not exists featured_image_public_id text;

alter table public.about
  add column if not exists hero_image_url text,
  add column if not exists hero_image_public_id text;

alter table public.website_settings
  add column if not exists logo_public_id text,
  add column if not exists favicon_public_id text,
  add column if not exists og_image_public_id text;
