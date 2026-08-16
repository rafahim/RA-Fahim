-- ============================================================================
-- About content fields
-- ============================================================================
-- Reshapes the `about` singleton table to match the fields editable from
-- /admin/about: Name, Professional title, Experience, About heading,
-- About description, Profile/Hero image, Additional information.
--
-- `headline`/`subheading`/`bio` and the separate `hero_image_*` columns
-- were never wired up to any public-facing component (Hero/About were
-- still hardcoded), so this replaces them outright rather than adding
-- yet another set of unused columns. The single profile image column is
-- reused as the "Profile/Hero image" shown on the public site.
--
-- Existing row data in the old columns is carried over into the new ones
-- so nothing is silently dropped for an already-deployed database.
-- ============================================================================

alter table public.about
  add column if not exists name text,
  add column if not exists professional_title text,
  add column if not exists experience text,
  add column if not exists about_heading text,
  add column if not exists about_description text,
  add column if not exists additional_info text;

-- Best-effort carry-over from the old columns before they're dropped.
update public.about
set
  professional_title = coalesce(professional_title, subheading),
  about_heading = coalesce(about_heading, headline),
  about_description = coalesce(about_description, bio)
where id = 1;

alter table public.about
  drop column if exists headline,
  drop column if exists subheading,
  drop column if exists bio,
  drop column if exists hero_image_url,
  drop column if exists hero_image_public_id;

-- Seed sensible defaults so the public site isn't blank on a fresh database.
update public.about
set
  name = coalesce(name, 'RA Fahim'),
  professional_title = coalesce(
    professional_title,
    'A 3D creator driven by crafting striking and unforgettable projects'
  ),
  experience = coalesce(experience, '5+ years'),
  about_heading = coalesce(about_heading, 'About me'),
  about_description = coalesce(
    about_description,
    'With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let''s build something incredible together!'
  )
where id = 1;
