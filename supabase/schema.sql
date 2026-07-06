-- Core admin users table
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  created_at timestamptz not null default now()
);

-- Events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  location text not null,
  event_date timestamptz not null,
  status text not null check (status in ('draft', 'published')) default 'draft',
  image_path text,
  created_at timestamptz not null default now()
);

-- News table
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  published_at timestamptz not null default now()
);

-- Recent activity table
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  created_at timestamptz not null default now()
);

-- Gallery table
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  caption text,
  event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Hero banner table (single active banner enforced by partial unique index)
create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  subtitle text not null,
  cta_text text not null,
  cta_link text not null,
  image_path text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dashboard manual override table (singleton row)
create table if not exists public.dashboard_manual_stats (
  id int primary key default 1 check (id = 1),
  use_manual boolean not null default false,
  instagram_followers bigint,
  youtube_views bigint,
  google_trends_score int check (google_trends_score between 0 and 100),
  updated_at timestamptz not null default now()
);

-- Navigation menu config table
create table if not exists public.navigation_menu (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  icon_key text not null default 'house',
  sort_order int not null default 100,
  is_active boolean not null default true,
  show_on_public boolean not null default true,
  show_on_admin boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists hero_banners_single_active_idx
on public.hero_banners (is_active)
where is_active = true;

-- Enable RLS
alter table public.admin_users enable row level security;
alter table public.events enable row level security;
alter table public.news enable row level security;
alter table public.activity_logs enable row level security;
alter table public.gallery_items enable row level security;
alter table public.hero_banners enable row level security;
alter table public.dashboard_manual_stats enable row level security;
alter table public.navigation_menu enable row level security;

-- Admin policy helper
create or replace function public.is_admin_user(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = uid
  );
$$;

-- Read policies for public-facing data
drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
on public.events
for select
using (status = 'published');

drop policy if exists "Public can read news" on public.news;
create policy "Public can read news"
on public.news
for select
using (true);

drop policy if exists "Public can read activity logs" on public.activity_logs;
create policy "Public can read activity logs"
on public.activity_logs
for select
using (true);

drop policy if exists "Public can read gallery" on public.gallery_items;
create policy "Public can read gallery"
on public.gallery_items
for select
using (true);

drop policy if exists "Public can read active hero" on public.hero_banners;
create policy "Public can read active hero"
on public.hero_banners
for select
using (is_active = true);

drop policy if exists "Public can read dashboard manual stats" on public.dashboard_manual_stats;
create policy "Public can read dashboard manual stats"
on public.dashboard_manual_stats
for select
using (true);

drop policy if exists "Public can read active navigation menu" on public.navigation_menu;
create policy "Public can read active navigation menu"
on public.navigation_menu
for select
using (is_active = true);

-- Admin full access policies
drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events"
on public.events
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "Admins manage news" on public.news;
create policy "Admins manage news"
on public.news
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "Admins manage activity" on public.activity_logs;
create policy "Admins manage activity"
on public.activity_logs
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "Admins manage gallery" on public.gallery_items;
create policy "Admins manage gallery"
on public.gallery_items
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "Admins manage hero" on public.hero_banners;
create policy "Admins manage hero"
on public.hero_banners
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "Admins manage dashboard manual stats" on public.dashboard_manual_stats;
create policy "Admins manage dashboard manual stats"
on public.dashboard_manual_stats
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "Admins manage navigation menu" on public.navigation_menu;
create policy "Admins manage navigation menu"
on public.navigation_menu
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "Users can read own admin row" on public.admin_users;
create policy "Users can read own admin row"
on public.admin_users
for select
using (auth.uid() = user_id);

-- Storage buckets (run once)
insert into storage.buckets (id, name, public)
values ('events', 'events', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('hero', 'hero', true)
on conflict (id) do nothing;

-- Storage object policies
drop policy if exists "Public can read event images" on storage.objects;
create policy "Public can read event images"
on storage.objects
for select
using (bucket_id = 'events');

drop policy if exists "Public can read gallery images" on storage.objects;
create policy "Public can read gallery images"
on storage.objects
for select
using (bucket_id = 'gallery');

drop policy if exists "Public can read hero images" on storage.objects;
create policy "Public can read hero images"
on storage.objects
for select
using (bucket_id = 'hero');

drop policy if exists "Admins can upload event images" on storage.objects;
create policy "Admins can upload event images"
on storage.objects
for insert
with check (bucket_id = 'events' and public.is_admin_user(auth.uid()));

drop policy if exists "Admins can upload gallery images" on storage.objects;
create policy "Admins can upload gallery images"
on storage.objects
for insert
with check (bucket_id = 'gallery' and public.is_admin_user(auth.uid()));

drop policy if exists "Admins can upload hero images" on storage.objects;
create policy "Admins can upload hero images"
on storage.objects
for insert
with check (bucket_id = 'hero' and public.is_admin_user(auth.uid()));

drop policy if exists "Admins can update event images" on storage.objects;
create policy "Admins can update event images"
on storage.objects
for update
using (bucket_id = 'events' and public.is_admin_user(auth.uid()))
with check (bucket_id = 'events' and public.is_admin_user(auth.uid()));

drop policy if exists "Admins can update gallery images" on storage.objects;
create policy "Admins can update gallery images"
on storage.objects
for update
using (bucket_id = 'gallery' and public.is_admin_user(auth.uid()))
with check (bucket_id = 'gallery' and public.is_admin_user(auth.uid()));

drop policy if exists "Admins can update hero images" on storage.objects;
create policy "Admins can update hero images"
on storage.objects
for update
using (bucket_id = 'hero' and public.is_admin_user(auth.uid()))
with check (bucket_id = 'hero' and public.is_admin_user(auth.uid()));

drop policy if exists "Admins can delete event images" on storage.objects;
create policy "Admins can delete event images"
on storage.objects
for delete
using (bucket_id = 'events' and public.is_admin_user(auth.uid()));

drop policy if exists "Admins can delete gallery images" on storage.objects;
create policy "Admins can delete gallery images"
on storage.objects
for delete
using (bucket_id = 'gallery' and public.is_admin_user(auth.uid()));

drop policy if exists "Admins can delete hero images" on storage.objects;
create policy "Admins can delete hero images"
on storage.objects
for delete
using (bucket_id = 'hero' and public.is_admin_user(auth.uid()));
