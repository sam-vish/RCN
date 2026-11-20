-- RCN North America V1 schema (PRD §8). Run once in the Supabase SQL editor, then seed.sql.
-- Concepts mirror the live rcnnorthamerica.com so data can migrate either way.
--
-- RLS model:
--   * public (anon) can READ published content and INSERT submissions, nothing else
--   * prayer requests are readable only by leaders of that branch + network admins
--   * branch admins can edit their own branch; network admins can edit everything

create extension if not exists pgcrypto;

-- ---------- people & roles ----------
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text not null default 'team' check (role in ('network_admin', 'branch_admin', 'team')),
  branch_slug text,
  created_at timestamptz default now()
);

create or replace function is_network_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'network_admin')
$$;
create or replace function admin_branch() returns text language sql stable security definer set search_path = public as $$
  select branch_slug from profiles where id = auth.uid() and role = 'branch_admin'
$$;

-- ---------- network content ----------
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_name text,
  city text, region text, country text,
  description text,
  address text,
  lat double precision, lng double precision,
  email text, phone text,
  socials jsonb default '{}'::jsonb,
  giving_url text,
  logo_url text,
  hero_image_url text,
  what_to_expect jsonb,
  parking_notes text,
  extensions jsonb default '{}'::jsonb,
  is_active boolean default true,
  sort_order int default 0
);

create table if not exists meeting_times (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches on delete cascade,
  day text not null,               -- Sunday..Saturday | Daily
  title text not null,
  start_time time, end_time time,
  timezone text not null,          -- IANA, e.g. America/New_York
  recurrence jsonb default '{"kind":"weekly"}'::jsonb, -- {"kind":"nth","n":[-1]} = last <day> of month
  recurrence_note text,
  online_url text,
  active_until date,
  sort_order int default 0
);

create table if not exists leaders (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches on delete cascade, -- null = network leadership
  name text not null,
  title text,
  photo_url text,
  sort_order int default 0
);

-- Fields branch leaders edit from /admin (merged over the static defaults in content/branches.ts).
create table if not exists branch_content (
  slug text primary key,
  what_to_expect jsonb,
  parking_notes text[],
  giving_url text,
  whatsapp_url text,
  telegram_url text,
  chmeetings_url text,
  hero_image_url text,
  meetings jsonb,                  -- same shape as content/types.ts Meeting[]; overrides the defaults
  leaders jsonb,                   -- [{ name, title, photo }]
  updated_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  branch_slug text,                -- null for network/itinerary
  scope text not null check (scope in ('network', 'branch', 'itinerary')),
  title text not null,
  slug text unique not null,
  start_at timestamptz, end_at timestamptz,
  venue text, address text, city text,
  description text,
  registration_enabled boolean default false,
  capacity int,
  image_url text,
  is_published boolean default false,
  created_at timestamptz default now()
);
create or replace view events_public with (security_invoker = true) as
  select slug, scope, title, start_at, end_at, venue, address, city, description, registration_enabled, capacity, branch_slug
  from events where is_published;

create table if not exists newsletters (
  id uuid primary key default gen_random_uuid(),
  title text not null, summary text, url text,
  is_published boolean default false,
  published_at timestamptz default now()
);

create table if not exists gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null, event_date date, cover_url text, branch text,
  is_published boolean default false
);
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references gallery_albums on delete cascade,
  url text not null, alt text, sort_order int default 0
);
create or replace view gallery_albums_public with (security_invoker = true) as
  select a.id, a.title, a.event_date, a.cover_url, a.branch,
    coalesce((select jsonb_agg(jsonb_build_object('url', i.url, 'alt', i.alt) order by i.sort_order) from gallery_items i where i.album_id = a.id), '[]'::jsonb) as items
  from gallery_albums a where a.is_published;

create table if not exists team_docs (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('policies', 'guidelines', 'forms', 'brand')),
  title text not null, file_url text, sort_order int default 0
);

-- ---------- submissions (public insert only) ----------
create table if not exists visits (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  branch text not null, gathering text, visit_date text, name text, email text, phone text, adults int, kids int, notes text
);
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  event text not null, name text, email text, phone text, branch text, attending int, notes text
);
create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  branch text, name text, email text, phone text, request text not null, may_contact boolean default false
);
create table if not exists testimonies (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  name text, email text, title text, branch text, testimony text not null, consent_publish boolean default false,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  published_at timestamptz
);
create or replace view testimonies_public with (security_invoker = true) as
  select id, name, title, testimony, branch, published_at from testimonies where status = 'published' and consent_publish;
create table if not exists newsletter_signups (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  first_name text, email text not null, branch text, source text
);
create table if not exists serve_signups (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  team text, name text, email text, phone text, branch text, skills text, message text
);
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  branch text, name text, email text, phone text, message text
);

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table branches enable row level security;
alter table meeting_times enable row level security;
alter table leaders enable row level security;
alter table branch_content enable row level security;
alter table events enable row level security;
alter table newsletters enable row level security;
alter table gallery_albums enable row level security;
alter table gallery_items enable row level security;
alter table team_docs enable row level security;
alter table visits enable row level security;
alter table event_registrations enable row level security;
alter table prayer_requests enable row level security;
alter table testimonies enable row level security;
alter table newsletter_signups enable row level security;
alter table serve_signups enable row level security;
alter table contact_messages enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid() or is_network_admin());

-- public reads
create policy "read branches" on branches for select using (is_active);
create policy "read meetings" on meeting_times for select using (true);
create policy "read leaders" on leaders for select using (true);
create policy "read branch content" on branch_content for select using (true);
create policy "read published events" on events for select using (is_published or is_network_admin() or branch_slug = admin_branch());
create policy "read published newsletters" on newsletters for select using (is_published);
create policy "read published albums" on gallery_albums for select using (is_published);
create policy "read album items" on gallery_items for select using (exists (select 1 from gallery_albums a where a.id = album_id and a.is_published));
create policy "read published testimonies" on testimonies for select using (status = 'published' and consent_publish or is_network_admin());

-- team docs: signed-in team only
create policy "team reads docs" on team_docs for select using (auth.uid() is not null);

-- public submissions: insert only
create policy "submit visit" on visits for insert with check (true);
create policy "submit registration" on event_registrations for insert with check (true);
create policy "submit prayer" on prayer_requests for insert with check (true);
create policy "submit testimony" on testimonies for insert with check (status = 'pending');
create policy "submit newsletter" on newsletter_signups for insert with check (true);
create policy "submit serve" on serve_signups for insert with check (true);
create policy "submit contact" on contact_messages for insert with check (true);

-- leaders read their branch's submissions; prayer requests ONLY by that branch's leaders + network admins
create policy "leaders read prayer" on prayer_requests for select using (is_network_admin() or branch = admin_branch());
create policy "leaders read visits" on visits for select using (is_network_admin() or branch = admin_branch());
create policy "leaders read contact" on contact_messages for select using (is_network_admin() or branch = admin_branch());
create policy "leaders read serve" on serve_signups for select using (is_network_admin() or branch = admin_branch());
create policy "leaders read registrations" on event_registrations for select using (is_network_admin() or branch = admin_branch());
create policy "admins read signups" on newsletter_signups for select using (is_network_admin());

-- edits
create policy "admins write branch content" on branch_content for all
  using (is_network_admin() or slug = admin_branch()) with check (is_network_admin() or slug = admin_branch());
create policy "admins write events" on events for all
  using (is_network_admin() or branch_slug = admin_branch()) with check (is_network_admin() or (branch_slug = admin_branch() and scope = 'branch'));
create policy "admins moderate testimonies" on testimonies for update using (is_network_admin());
create policy "network admins write branches" on branches for all using (is_network_admin()) with check (is_network_admin());
create policy "network admins write meetings" on meeting_times for all using (is_network_admin()) with check (is_network_admin());
create policy "network admins write leaders" on leaders for all using (is_network_admin()) with check (is_network_admin());
create policy "network admins write docs" on team_docs for all using (is_network_admin()) with check (is_network_admin());
create policy "network admins write newsletters" on newsletters for all using (is_network_admin()) with check (is_network_admin());
create policy "network admins write albums" on gallery_albums for all using (is_network_admin()) with check (is_network_admin());
create policy "network admins write items" on gallery_items for all using (is_network_admin()) with check (is_network_admin());

grant select on events_public, testimonies_public, gallery_albums_public to anon, authenticated;
