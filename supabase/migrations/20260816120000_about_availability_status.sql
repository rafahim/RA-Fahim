-- ============================================================================
-- Hero availability badge text
-- ============================================================================
-- Adds an editable "availability status" line for the small pulsing badge
-- above the hero name (e.g. "Available for new projects — 3D Creator"),
-- which was previously hardcoded in HeroSection.tsx.
-- ============================================================================

alter table public.about
  add column if not exists availability_status text;

update public.about
set availability_status = coalesce(availability_status, 'Available for new projects — 3D Creator')
where id = 1;
