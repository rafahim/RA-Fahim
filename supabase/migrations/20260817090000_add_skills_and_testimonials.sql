-- ============================================================================
-- skills — the "Tool Proficiency" meters shown in the About section.
-- testimonials — the quotes shown in the "What clients say" section.
-- ============================================================================
-- Both are flat, admin-managed lists (no draft/published state — like
-- marquee_images, the list an admin sees IS the list visitors see;
-- deleting a row is how an admin removes it from the public site).
-- Seeded with the original placeholder content that shipped with the
-- template so neither section ever renders empty out of the box; admins
-- can edit/delete any/all of these and add their own from the admin panel.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- skills
-- ----------------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null default 'Intermediate'
    check (level in ('Intermediate', 'Advanced', 'Expert')),
  value integer not null default 50 check (value between 0 and 100),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_display_order_idx
  on public.skills (display_order);

create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

alter table public.skills enable row level security;

create policy "Public can read skills"
  on public.skills for select
  to anon, authenticated
  using (true);

create policy "Admins can insert skills"
  on public.skills for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update skills"
  on public.skills for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete skills"
  on public.skills for delete
  to authenticated
  using (public.is_admin());

insert into public.skills (name, level, value, display_order)
select v.name, v.level, v.value, v.display_order
from (
  values
    ('Blender', 'Expert', 95, 0),
    ('Cinema 4D', 'Expert', 92, 1),
    ('Octane Render', 'Advanced', 85, 2),
    ('Redshift', 'Advanced', 82, 3),
    ('After Effects', 'Intermediate', 68, 4)
) as v(name, level, value, display_order)
where not exists (select 1 from public.skills);

-- ----------------------------------------------------------------------------
-- testimonials
-- ----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  client_name text not null,
  client_role text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_display_order_idx
  on public.testimonials (display_order);

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy "Public can read testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (true);

create policy "Admins can insert testimonials"
  on public.testimonials for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update testimonials"
  on public.testimonials for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete testimonials"
  on public.testimonials for delete
  to authenticated
  using (public.is_admin());

insert into public.testimonials (quote, client_name, client_role, display_order)
select v.quote, v.client_name, v.client_role, v.display_order
from (
  values
    (
      'RA Fahim turned a vague brief into a render that sold the product before it even shipped. Fast, precise, and genuinely fun to collaborate with.',
      'Client Name',
      'Founder, Studio Name',
      0
    ),
    (
      'The attention to lighting and material detail was next level. Every revision came back better than what we asked for.',
      'Client Name',
      'Creative Director, Agency Name',
      1
    ),
    (
      'Deadlines, communication, quality -- all solid. We''ve since brought RA Fahim onto every 3D piece of our pipeline.',
      'Client Name',
      'Product Lead, Company Name',
      2
    )
) as v(quote, client_name, client_role, display_order)
where not exists (select 1 from public.testimonials);
