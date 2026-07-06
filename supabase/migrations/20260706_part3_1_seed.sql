-- Part 3.1: Seed data for the Part 3 database schema
-- Run this after: 20260706_part3_database_schema.sql

with upsert_artist as (
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
  returning id
), selected_artist as (
  select id from upsert_artist
  union all
  select id from public.artists where slug = 'emi' limit 1
)
insert into public.settings (artist_id, key, value)
select
  sa.id,
  v.key,
  v.value::jsonb
from selected_artist sa
cross join (values
  ('homepage.hero_cta', '{"label":"See Live Updates","href":"/#live-updates"}'),
  ('homepage.theme', '{"layout":"premium-neutral","density":"comfortable"}')
) as v(key, value)
where not exists (
  select 1
  from public.settings s
  where s.artist_id = sa.id
    and s.key = v.key
);

with artist as (
  select id from public.artists where slug = 'emi' limit 1
)
insert into public.social_accounts (
  artist_id,
  platform,
  platform_external_id,
  account_handle,
  profile_url,
  is_active
)
select
  artist.id,
  v.platform,
  v.platform_external_id,
  v.account_handle,
  v.profile_url,
  true
from artist
cross join (values
  ('instagram', 'ig_emi_official', 'emi.official', 'https://instagram.com/emi.official'),
  ('youtube', 'yt_emi_channel', '@emi-official', 'https://youtube.com/@emi-official'),
  ('tiktok', 'tt_emi', '@emi', 'https://tiktok.com/@emi'),
  ('x', 'x_emi', '@emi', 'https://x.com/emi'),
  ('threads', 'threads_emi', '@emi', 'https://threads.net/@emi'),
  ('facebook', 'fb_emi', 'EMI Official', 'https://facebook.com/EMIOfficial')
) as v(platform, platform_external_id, account_handle, profile_url)
on conflict (artist_id, platform)
do update set
  platform_external_id = excluded.platform_external_id,
  account_handle = excluded.account_handle,
  profile_url = excluded.profile_url,
  is_active = excluded.is_active,
  updated_at = now();

with artist as (
  select id from public.artists where slug = 'emi' limit 1
), inserted_events as (
  insert into public.events (
    artist_id,
    title,
    subtitle,
    description,
    location,
    country,
    event_date,
    status,
    cover_image_path,
    image_path,
    tags,
    featured
  )
  select
    artist.id,
    v.title,
    v.subtitle,
    v.description,
    v.location,
    v.country,
    v.event_date,
    v.status,
    v.cover_image_path,
    v.image_path,
    v.tags,
    v.featured
  from artist
  cross join (values
    (
      'EMI Pulse Live: Bangkok',
      'World Tour Opening Night',
      'A showcase night with live performances and fan interaction sessions.',
      'Royal Arena, Bangkok',
      'Thailand',
      now() + interval '7 day',
      'published',
      'events/emi-bangkok-cover.jpg',
      'events/emi-bangkok-cover.jpg',
      array['tour','live','featured']::text[],
      true
    ),
    (
      'Studio Behind The Scenes',
      'Inside the recording process',
      'Private recording session highlights and production breakdown.',
      'EMI Studio',
      'Thailand',
      now() + interval '14 day',
      'draft',
      'events/emi-studio-cover.jpg',
      'events/emi-studio-cover.jpg',
      array['studio','production']::text[],
      false
    )
  ) as v(title, subtitle, description, location, country, event_date, status, cover_image_path, image_path, tags, featured)
  where not exists (
    select 1
    from public.events e
    where e.title = v.title
  )
  returning id, artist_id, title
)
insert into public.news (
  artist_id,
  title,
  summary,
  cover_image_path,
  published_at
)
select
  ie.artist_id,
  n.title,
  n.summary,
  n.cover_image_path,
  n.published_at
from inserted_events ie
join (values
  (
    'New EMI Single Announced',
    'The next single drops this month with a global digital premiere.',
    'news/emi-single.jpg',
    now() - interval '2 day'
  ),
  (
    'Tour Teaser Released',
    'Short teaser gives fans a first look at the upcoming stage concept.',
    'news/emi-tour-teaser.jpg',
    now() - interval '1 day'
  )
) as n(title, summary, cover_image_path, published_at) on true
where ie.title = 'EMI Pulse Live: Bangkok'
  and not exists (
    select 1
    from public.news existing
    where existing.title = n.title
  );

with artist as (
  select id from public.artists where slug = 'emi' limit 1
), target_event as (
  select id, artist_id
  from public.events
  where title = 'EMI Pulse Live: Bangkok'
  limit 1
)
insert into public.gallery (
  artist_id,
  event_id,
  image_path,
  caption,
  alt_text,
  is_public,
  sort_order
)
select
  artist.id,
  target_event.id,
  'gallery/emi-opening-stage.jpg',
  'Opening stage visual concept',
  'EMI performing on opening stage with dynamic lights',
  true,
  10
from artist
left join target_event on target_event.artist_id = artist.id
where not exists (
  select 1
  from public.gallery g
  where g.image_path = 'gallery/emi-opening-stage.jpg'
);

-- Backward compatibility for legacy table used by existing pages.
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
on conflict do nothing;

with artist as (
  select id from public.artists where slug = 'emi' limit 1
), related_event as (
  select id from public.events where title = 'EMI Pulse Live: Bangkok' limit 1
)
insert into public.activity_logs (
  artist_id,
  action,
  entity_type,
  entity_id,
  metadata,
  created_at
)
select
  artist.id,
  v.action,
  v.entity_type,
  case when v.entity_type = 'event' then related_event.id else null end,
  v.metadata::jsonb,
  v.created_at
from artist
left join related_event on true
cross join (values
  ('Event Published', 'event', '{"title":"EMI Pulse Live: Bangkok"}', now() - interval '5 hour'),
  ('Gallery Uploaded', 'gallery', '{"image":"gallery/emi-opening-stage.jpg"}', now() - interval '2 hour'),
  ('News Published', 'news', '{"title":"Tour Teaser Released"}', now() - interval '1 hour')
) as v(action, entity_type, metadata, created_at)
where not exists (
  select 1
  from public.activity_logs logs
  where logs.action = v.action
    and logs.created_at::date = current_date
);

with artist as (
  select id from public.artists where slug = 'emi' limit 1
), accounts as (
  select id, artist_id, platform
  from public.social_accounts
  where artist_id = (select id from artist)
)
insert into public.social_metrics (
  artist_id,
  social_account_id,
  metric_name,
  metric_value,
  collected_at
)
select
  a.artist_id,
  a.id,
  m.metric_name,
  m.metric_value,
  now()
from accounts a
join (values
  ('instagram', 'followers', 1302154::numeric),
  ('youtube', 'views', 28700000::numeric),
  ('tiktok', 'views', 9600000::numeric),
  ('x', 'mentions', 16200::numeric),
  ('threads', 'followers', 184000::numeric),
  ('facebook', 'followers', 425000::numeric)
) as m(platform, metric_name, metric_value)
  on a.platform = m.platform
where not exists (
  select 1
  from public.social_metrics sm
  where sm.social_account_id = a.id
    and sm.metric_name = m.metric_name
    and sm.collected_at::date = current_date
);
