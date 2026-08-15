-- ============================================================================
-- marquee_images — the scrolling image strip shown below the Hero section.
-- ============================================================================
-- A flat, admin-managed list of images (no draft/published state — unlike
-- projects/services, every row here is shown; deleting a row is how an
-- admin removes it from the strip). Seeded with the original placeholder
-- images that shipped with the template so the section never renders
-- empty out of the box; admins can delete any/all of these and add their
-- own from the admin panel.
-- ============================================================================

create table if not exists public.marquee_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  cloudinary_public_id text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists marquee_images_display_order_idx
  on public.marquee_images (display_order);

alter table public.marquee_images enable row level security;

-- Public content, no draft state — readable by anyone.
create policy "Public can read marquee images"
  on public.marquee_images for select
  to anon, authenticated
  using (true);

create policy "Admins can insert marquee images"
  on public.marquee_images for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update marquee images"
  on public.marquee_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete marquee images"
  on public.marquee_images for delete
  to authenticated
  using (public.is_admin());

-- Seed with the template's original placeholder images (only if the table
-- is empty, so re-running this migration never duplicates rows).
insert into public.marquee_images (image_url, display_order)
select v.image_url, v.display_order
from (
  values
    ('https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif', 0),
    ('https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif', 1),
    ('https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif', 2),
    ('https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif', 3),
    ('https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif', 4),
    ('https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif', 5),
    ('https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif', 6),
    ('https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif', 7),
    ('https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif', 8),
    ('https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif', 9),
    ('https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif', 10),
    ('https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif', 11),
    ('https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif', 12),
    ('https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif', 13),
    ('https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif', 14),
    ('https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif', 15),
    ('https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif', 16),
    ('https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif', 17),
    ('https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif', 18),
    ('https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif', 19),
    ('https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif', 20)
) as v(image_url, display_order)
where not exists (select 1 from public.marquee_images);
