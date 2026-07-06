-- Part 3: Database schema foundation for Pulse
-- Requirements covered:
-- - UUID primary keys
-- - Foreign keys
-- - created_at / updated_at
-- - indexes
-- - row level security

create extension if not exists pgcrypto;

-- Keep admin helper available for RLS policies.
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

-- Shared updated_at trigger function.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) artists
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  biography text,
  country text,
  theme_color text,
  profile_image_path text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) social_accounts
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'youtube', 'tiktok', 'x', 'threads', 'facebook')),
  platform_external_id text,
  account_handle text,
  profile_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, platform)
);

-- 3) events (existing table adjusted for Part 3 requirements)
alter table public.events
  add column if not exists artist_id uuid references public.artists(id) on delete set null,
  add column if not exists subtitle text,
  add column if not exists country text,
  add column if not exists cover_image_path text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists featured boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- 4) gallery
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  image_path text not null,
  caption text,
  alt_text text,
  is_public boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) news (existing table adjusted)
alter table public.news
  add column if not exists artist_id uuid references public.artists(id) on delete set null,
  add column if not exists cover_image_path text,
  add column if not exists updated_at timestamptz not null default now();

-- 6) activity_logs (existing table adjusted)
alter table public.activity_logs
  add column if not exists artist_id uuid references public.artists(id) on delete set null,
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

-- 7) social_metrics
create table if not exists public.social_metrics (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete set null,
  metric_name text not null,
  metric_value numeric(20, 2) not null default 0,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8) settings
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, key)
);

-- Indexes
create index if not exists idx_artists_slug on public.artists(slug);
create index if not exists idx_social_accounts_artist_id on public.social_accounts(artist_id);
create index if not exists idx_social_accounts_platform on public.social_accounts(platform);
create index if not exists idx_events_artist_id on public.events(artist_id);
create index if not exists idx_events_status_event_date on public.events(status, event_date desc);
create index if not exists idx_events_featured_event_date on public.events(featured, event_date desc);
create index if not exists idx_gallery_artist_id on public.gallery(artist_id);
create index if not exists idx_gallery_event_id on public.gallery(event_id);
create index if not exists idx_gallery_public_sort on public.gallery(is_public, sort_order);
create index if not exists idx_news_artist_id on public.news(artist_id);
create index if not exists idx_news_published_at on public.news(published_at desc);
create index if not exists idx_activity_logs_artist_created on public.activity_logs(artist_id, created_at desc);
create index if not exists idx_activity_logs_entity on public.activity_logs(entity_type, entity_id);
create index if not exists idx_social_metrics_artist_collected on public.social_metrics(artist_id, collected_at desc);
create index if not exists idx_social_metrics_account_collected on public.social_metrics(social_account_id, collected_at desc);
create index if not exists idx_settings_artist_key on public.settings(artist_id, key);

-- updated_at triggers
drop trigger if exists trg_artists_set_updated_at on public.artists;
create trigger trg_artists_set_updated_at
before update on public.artists
for each row execute function public.set_updated_at();

drop trigger if exists trg_social_accounts_set_updated_at on public.social_accounts;
create trigger trg_social_accounts_set_updated_at
before update on public.social_accounts
for each row execute function public.set_updated_at();

drop trigger if exists trg_events_set_updated_at on public.events;
create trigger trg_events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists trg_gallery_set_updated_at on public.gallery;
create trigger trg_gallery_set_updated_at
before update on public.gallery
for each row execute function public.set_updated_at();

drop trigger if exists trg_news_set_updated_at on public.news;
create trigger trg_news_set_updated_at
before update on public.news
for each row execute function public.set_updated_at();

drop trigger if exists trg_activity_logs_set_updated_at on public.activity_logs;
create trigger trg_activity_logs_set_updated_at
before update on public.activity_logs
for each row execute function public.set_updated_at();

drop trigger if exists trg_social_metrics_set_updated_at on public.social_metrics;
create trigger trg_social_metrics_set_updated_at
before update on public.social_metrics
for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_set_updated_at on public.settings;
create trigger trg_settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

-- RLS enablement
alter table public.artists enable row level security;
alter table public.social_accounts enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.news enable row level security;
alter table public.activity_logs enable row level security;
alter table public.social_metrics enable row level security;
alter table public.settings enable row level security;

-- Public read policies
drop policy if exists p3_public_read_artists on public.artists;
create policy p3_public_read_artists
on public.artists
for select
using (is_public = true);

drop policy if exists p3_public_read_published_events on public.events;
create policy p3_public_read_published_events
on public.events
for select
using (status = 'published');

drop policy if exists p3_public_read_gallery on public.gallery;
create policy p3_public_read_gallery
on public.gallery
for select
using (is_public = true);

drop policy if exists p3_public_read_news on public.news;
create policy p3_public_read_news
on public.news
for select
using (published_at <= now());

drop policy if exists p3_public_read_activity_logs on public.activity_logs;
create policy p3_public_read_activity_logs
on public.activity_logs
for select
using (true);

-- Admin manage policies
drop policy if exists p3_admin_manage_artists on public.artists;
create policy p3_admin_manage_artists
on public.artists
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists p3_admin_manage_social_accounts on public.social_accounts;
create policy p3_admin_manage_social_accounts
on public.social_accounts
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists p3_admin_manage_events on public.events;
create policy p3_admin_manage_events
on public.events
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists p3_admin_manage_gallery on public.gallery;
create policy p3_admin_manage_gallery
on public.gallery
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists p3_admin_manage_news on public.news;
create policy p3_admin_manage_news
on public.news
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists p3_admin_manage_activity_logs on public.activity_logs;
create policy p3_admin_manage_activity_logs
on public.activity_logs
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists p3_admin_manage_social_metrics on public.social_metrics;
create policy p3_admin_manage_social_metrics
on public.social_metrics
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists p3_admin_manage_settings on public.settings;
create policy p3_admin_manage_settings
on public.settings
for all
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));
