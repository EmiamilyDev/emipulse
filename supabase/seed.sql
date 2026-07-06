-- Seed data for EMIPulse local/demo environment
-- This file is compatible with both legacy schema and Part 3 schema.

-- IMPORTANT:
-- Replace ADMIN_USER_UUID with a real auth.users.id from your Supabase project.
insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;

-- Legacy-compatible core seeds
insert into public.events (title, description, location, event_date, status, image_path)
values
  (
    'EMI Pulse Live: Bangkok',
    'A showcase night with live performances and fan interaction sessions.',
    'Royal Arena, Bangkok',
    now() + interval '7 day',
    'published',
    'events/emi-bangkok-cover.jpg'
  ),
  (
    'Studio Behind The Scenes',
    'Private recording session highlights and production breakdown.',
    'EMI Studio',
    now() + interval '14 day',
    'draft',
    'events/emi-studio-cover.jpg'
  )
on conflict do nothing;

insert into public.news (title, summary, published_at)
values
  (
    'New EMI Single Announced',
    'The next single drops this month with a global digital premiere.',
    now() - interval '2 day'
  ),
  (
    'Tour Teaser Released',
    'Short teaser gives fans a first look at the upcoming stage concept.',
    now() - interval '1 day'
  )
on conflict do nothing;

insert into public.activity_logs (action, created_at)
values
  ('Event Published', now() - interval '5 hour'),
  ('Gallery Uploaded', now() - interval '2 hour'),
  ('News Published', now() - interval '1 hour')
on conflict do nothing;

insert into public.hero_banners (
  headline,
  subtitle,
  cta_text,
  cta_link,
  image_path,
  is_active,
  created_at,
  updated_at
)
values (
  'EMIPulse: Everything fans follow, in one place.',
  'Live stats, updates, and the next moments from EMI.',
  'See Live Updates',
  '/#live-updates',
  'seed-hero.jpg',
  true,
  now(),
  now()
)
on conflict do nothing;

insert into public.dashboard_manual_stats (
  id,
  use_manual,
  instagram_followers,
  youtube_views,
  google_trends_score,
  updated_at
)
values (
  1,
  false,
  1302154,
  28700000,
  84,
  now()
)
on conflict (id) do nothing;

insert into public.navigation_menu (label, href, icon_key, sort_order, is_active, show_on_public, show_on_admin)
values
  ('Public Home', '/', 'house', 10, true, true, true),
  ('Dashboard', '/admin', 'activity', 20, true, true, true),
  ('Events', '/admin/events', 'calendar', 30, true, true, true),
  ('Gallery', '/admin/gallery', 'gallery', 40, true, true, true),
  ('Hero Banner', '/admin/hero', 'hero', 50, true, true, true)
on conflict do nothing;

insert into public.gallery_items (image_path, caption, event_id)
select
  'gallery/emi-opening-stage.jpg',
  'Opening stage visual concept',
  e.id
from public.events e
where e.title = 'EMI Pulse Live: Bangkok'
  and not exists (
    select 1
    from public.gallery_items gi
    where gi.image_path = 'gallery/emi-opening-stage.jpg'
  )
limit 1
on conflict do nothing;

-- Part 3 schema seeds (conditional, only run if tables exist)
do $$
declare
  artist_uuid uuid;
  featured_event_uuid uuid;
begin
  if to_regclass('public.artists') is null then
    raise notice 'Skipping Part 3 seed section because public.artists does not exist.';
    return;
  end if;

  insert into public.artists (
    name,
    slug,
    biography,
    country,
    theme_color,
    profile_image_path,
    is_public
  )
  values (
    'EMI',
    'emi',
    'Global pop artist blending performance, visual storytelling, and fan-first experiences.',
    'Thailand',
    '#111827',
    'artists/emi/profile.jpg',
    true
  )
  on conflict (slug)
  do update set
    name = excluded.name,
    biography = excluded.biography,
    country = excluded.country,
    theme_color = excluded.theme_color,
    profile_image_path = excluded.profile_image_path,
    is_public = excluded.is_public,
    updated_at = now()
  returning id into artist_uuid;

  if artist_uuid is null then
    select id into artist_uuid
    from public.artists
    where slug = 'emi'
    limit 1;
  end if;

  if artist_uuid is null then
    raise notice 'No artist row available, skipping Part 3 seed section.';
    return;
  end if;

  if to_regclass('public.settings') is not null then
    insert into public.settings (artist_id, key, value)
    values
      (artist_uuid, 'homepage.hero_cta', '{"label":"See Live Updates","href":"/#live-updates"}'::jsonb),
      (artist_uuid, 'homepage.theme', '{"layout":"premium-neutral","density":"comfortable"}'::jsonb)
    on conflict (artist_id, key)
    do update set
      value = excluded.value,
      updated_at = now();
  end if;

  if to_regclass('public.social_accounts') is not null then
    insert into public.social_accounts (
      artist_id,
      platform,
      platform_external_id,
      account_handle,
      profile_url,
      is_active
    )
    values
      (artist_uuid, 'instagram', 'ig_emi_official', 'emi.official', 'https://instagram.com/emi.official', true),
      (artist_uuid, 'youtube', 'yt_emi_channel', '@emi-official', 'https://youtube.com/@emi-official', true),
      (artist_uuid, 'tiktok', 'tt_emi', '@emi', 'https://tiktok.com/@emi', true),
      (artist_uuid, 'x', 'x_emi', '@emi', 'https://x.com/emi', true),
      (artist_uuid, 'threads', 'threads_emi', '@emi', 'https://threads.net/@emi', true),
      (artist_uuid, 'facebook', 'fb_emi', 'EMI Official', 'https://facebook.com/EMIOfficial', true)
    on conflict (artist_id, platform)
    do update set
      platform_external_id = excluded.platform_external_id,
      account_handle = excluded.account_handle,
      profile_url = excluded.profile_url,
      is_active = excluded.is_active,
      updated_at = now();
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'artist_id'
  ) then
    update public.events
    set
      artist_id = artist_uuid,
      subtitle = case
        when title = 'EMI Pulse Live: Bangkok' then 'World Tour Opening Night'
        when title = 'Studio Behind The Scenes' then 'Inside the recording process'
        else subtitle
      end,
      country = coalesce(country, 'Thailand'),
      cover_image_path = coalesce(cover_image_path, image_path),
      tags = case
        when title = 'EMI Pulse Live: Bangkok' then array['tour','live','featured']::text[]
        when title = 'Studio Behind The Scenes' then array['studio','production']::text[]
        else tags
      end,
      featured = case when title = 'EMI Pulse Live: Bangkok' then true else coalesce(featured, false) end,
      updated_at = now()
    where title in ('EMI Pulse Live: Bangkok', 'Studio Behind The Scenes');
  end if;

  select id into featured_event_uuid
  from public.events
  where title = 'EMI Pulse Live: Bangkok'
  order by event_date desc
  limit 1;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'news'
      and column_name = 'artist_id'
  ) then
    update public.news
    set
      artist_id = artist_uuid,
      cover_image_path = case
        when title = 'New EMI Single Announced' then 'news/emi-single.jpg'
        when title = 'Tour Teaser Released' then 'news/emi-tour-teaser.jpg'
        else cover_image_path
      end,
      updated_at = now()
    where title in ('New EMI Single Announced', 'Tour Teaser Released');
  end if;

  if to_regclass('public.gallery') is not null then
    insert into public.gallery (
      artist_id,
      event_id,
      image_path,
      caption,
      alt_text,
      is_public,
      sort_order
    )
    values (
      artist_uuid,
      featured_event_uuid,
      'gallery/emi-opening-stage.jpg',
      'Opening stage visual concept',
      'EMI performing on opening stage with dynamic lights',
      true,
      10
    )
    on conflict do nothing;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'activity_logs'
      and column_name = 'artist_id'
  ) then
    update public.activity_logs
    set
      artist_id = artist_uuid,
      entity_type = case
        when action ilike '%event%' then 'event'
        when action ilike '%gallery%' then 'gallery'
        when action ilike '%news%' then 'news'
        else entity_type
      end,
      entity_id = case when action ilike '%event%' then featured_event_uuid else entity_id end,
      metadata = case
        when action = 'Event Published' then '{"title":"EMI Pulse Live: Bangkok"}'::jsonb
        when action = 'Gallery Uploaded' then '{"image":"gallery/emi-opening-stage.jpg"}'::jsonb
        when action = 'News Published' then '{"title":"Tour Teaser Released"}'::jsonb
        else metadata
      end,
      updated_at = now()
    where action in ('Event Published', 'Gallery Uploaded', 'News Published');
  end if;

  if to_regclass('public.social_metrics') is not null then
    insert into public.social_metrics (
      artist_id,
      social_account_id,
      metric_name,
      metric_value,
      collected_at
    )
    select
      sa.artist_id,
      sa.id,
      m.metric_name,
      m.metric_value,
      now()
    from public.social_accounts sa
    join (
      values
        ('instagram', 'followers', 1302154::numeric),
        ('youtube', 'views', 28700000::numeric),
        ('tiktok', 'views', 9600000::numeric),
        ('x', 'mentions', 16200::numeric),
        ('threads', 'followers', 184000::numeric),
        ('facebook', 'followers', 425000::numeric)
    ) as m(platform, metric_name, metric_value)
      on sa.platform = m.platform
    where sa.artist_id = artist_uuid
      and not exists (
        select 1
        from public.social_metrics sm
        where sm.social_account_id = sa.id
          and sm.metric_name = m.metric_name
          and sm.collected_at::date = current_date
      );
  end if;
end $$;
