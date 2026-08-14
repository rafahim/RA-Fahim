-- ============================================================================
-- Portfolio CMS — initial schema
-- ============================================================================
-- Creates: projects, project_images, services, about, contact_settings,
-- website_settings, messages, admin_users.
--
-- Admin auth model
-- -----------------
-- Admins are regular Supabase Auth users (auth.users). No passwords are
-- stored in application tables. An admin is any auth.users row whose id
-- also exists in public.admin_users. public.is_admin() is a
-- SECURITY DEFINER helper used by every RLS policy below so policies never
-- need direct access to auth.users or recurse through admin_users' own RLS.
--
-- To promote a user to admin (run once, from the SQL editor or via the
-- service-role key — never from the browser):
--   insert into public.admin_users (id) values ('<auth-user-uuid>');
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Shared helper: keep updated_at current on every row update.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- admin_users — allow-list of Supabase Auth users who may manage content.
-- ============================================================================
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Intentionally no policies: this table is only ever read/written by the
-- SECURITY DEFINER function below or via the service-role key. Default
-- deny applies to both anon and authenticated clients.

-- SECURITY DEFINER so it can check admin_users regardless of the caller's
-- own RLS visibility, without granting the caller direct table access.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au where au.id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================================
-- projects
-- ============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  client_type text,
  short_description text,
  full_description text,
  project_url text,
  year integer check (year is null or (year between 1900 and 2100)),
  featured_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_display_order_idx
  on public.projects (status, display_order);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "Public can read published projects"
  on public.projects for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can read all projects"
  on public.projects for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert projects"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update projects"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete projects"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- project_images — gallery images belonging to a project.
-- ============================================================================
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  image_url text not null,
  cloudinary_public_id text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_id_idx
  on public.project_images (project_id, display_order);

alter table public.project_images enable row level security;

create policy "Public can read images of published projects"
  on public.project_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id
        and p.status = 'published'
    )
  );

create policy "Admins can read all project images"
  on public.project_images for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert project images"
  on public.project_images for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update project images"
  on public.project_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete project images"
  on public.project_images for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- services
-- ============================================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  service_number text not null,
  name text not null,
  description text,
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_published_display_order_idx
  on public.services (published, display_order);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

alter table public.services enable row level security;

create policy "Public can read published services"
  on public.services for select
  to anon, authenticated
  using (published = true);

create policy "Admins can read all services"
  on public.services for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert services"
  on public.services for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update services"
  on public.services for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete services"
  on public.services for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- about — singleton table (one row) holding portfolio/about content.
-- ============================================================================
create table if not exists public.about (
  id smallint primary key default 1 check (id = 1),
  headline text,
  subheading text,
  bio text,
  profile_image_url text,
  profile_image_public_id text,
  updated_at timestamptz not null default now()
);

insert into public.about (id) values (1) on conflict (id) do nothing;

create trigger about_set_updated_at
  before update on public.about
  for each row execute function public.set_updated_at();

alter table public.about enable row level security;

-- "About" is always-public profile content — there's no draft state for it.
create policy "Public can read about content"
  on public.about for select
  to anon, authenticated
  using (true);

create policy "Admins can update about content"
  on public.about for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No insert/delete policies: the singleton row is seeded above and should
-- never be removed. Admins edit it via UPDATE only.

-- ============================================================================
-- contact_settings — singleton table of public contact / social links.
-- ============================================================================
create table if not exists public.contact_settings (
  id smallint primary key default 1 check (id = 1),
  email text,
  phone text,
  whatsapp text,
  facebook text,
  instagram text,
  linkedin text,
  behance text,
  other_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.contact_settings (id) values (1) on conflict (id) do nothing;

create trigger contact_settings_set_updated_at
  before update on public.contact_settings
  for each row execute function public.set_updated_at();

alter table public.contact_settings enable row level security;

create policy "Public can read contact settings"
  on public.contact_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can update contact settings"
  on public.contact_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- website_settings — singleton table of site title/SEO/branding.
-- ============================================================================
create table if not exists public.website_settings (
  id smallint primary key default 1 check (id = 1),
  website_title text,
  website_description text,
  logo_url text,
  favicon_url text,
  seo_title text,
  seo_description text,
  og_image_url text,
  updated_at timestamptz not null default now()
);

insert into public.website_settings (id) values (1) on conflict (id) do nothing;

create trigger website_settings_set_updated_at
  before update on public.website_settings
  for each row execute function public.set_updated_at();

alter table public.website_settings enable row level security;

create policy "Public can read website settings"
  on public.website_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can update website settings"
  on public.website_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- messages — contact-form submissions.
-- ============================================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) > 0),
  email text not null check (char_length(btrim(email)) > 0),
  message text not null check (char_length(btrim(message)) > 0),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

alter table public.messages enable row level security;

-- Anyone can submit the public contact form, but cannot read messages back
-- (no public select policy at all — inserts are write-only for the public).
create policy "Public can submit a message"
  on public.messages for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read messages"
  on public.messages for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update messages"
  on public.messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete messages"
  on public.messages for delete
  to authenticated
  using (public.is_admin());
