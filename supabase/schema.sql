-- ============================================================
-- Donnie Discount — Supabase Schema
-- Run in Supabase SQL Editor after creating a project.
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Deals ────────────────────────────────────────────────────
create table if not exists deals (
  id                  uuid primary key default gen_random_uuid(),
  external_id         text unique,           -- affiliate feed item ID
  title               text not null,
  description         text,
  image_url           text,
  original_price      numeric(10,2) not null,
  discounted_price    numeric(10,2) not null,
  discount_percentage int not null,
  category            text,                  -- 'tech' | 'kitchen' | 'home' | 'fashion' | ...
  affiliate_store     text not null,         -- 'bol.com' | 'amazon' | 'coolblue' | ...
  affiliate_network   text,                  -- 'awin' | 'amazon' | 'ebay' | 'direct'
  affiliate_url       text,                  -- final deep link (already wrapped)
  asin                text,                  -- Amazon product ID
  awin_merchant_id    int,
  regions             text[] default '{"NL"}',  -- which regions see this deal
  fomo_key            text,                  -- 'hot' | 'flash' | 'limited' | ...
  expires_at          timestamptz,
  is_active           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── Deal clicks ──────────────────────────────────────────────
create table if not exists deal_clicks (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid references deals(id) on delete cascade,
  session_id  text,
  region      text,
  created_at  timestamptz default now()
);

-- ── Deal favorites (server-side backup) ──────────────────────
create table if not exists deal_favorites (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid references deals(id) on delete cascade,
  session_id  text not null,
  created_at  timestamptz default now(),
  unique(deal_id, session_id)
);

-- ── Affiliate feed imports (audit log) ───────────────────────
create table if not exists feed_imports (
  id           uuid primary key default gen_random_uuid(),
  source       text not null,   -- 'awin' | 'amazon' | 'manual'
  deals_added  int default 0,
  deals_updated int default 0,
  deals_expired int default 0,
  started_at   timestamptz default now(),
  finished_at  timestamptz
);

-- ── Ranked deals view ────────────────────────────────────────
-- Used by the API to serve pre-ranked deals.
create or replace view ranked_deals as
select
  d.*,
  coalesce(c.click_count, 0)   as click_count,
  coalesce(f.fav_count, 0)     as fav_count,
  -- Composite score (mirrors services/ranking.js)
  (
    least(d.discount_percentage, 80) * 0.5
    + least((d.original_price - d.discounted_price) / 5, 15)
    + least(coalesce(c.click_count, 0) * 0.5, 20)
    + case d.fomo_key
        when 'flash'      then 20
        when 'hot'        then 18
        when 'hour3'      then 18
        when 'limited'    then 15
        when 'stock'      then 15
        when 'timer'      then 12
        when 'today'      then 12
        when 'popular'    then 10
        when 'topdeal'    then 10
        when 'bestseller' then 6
        else 0
      end
    + case
        when d.discounted_price between 15 and 250 then 10
        when d.discounted_price < 15              then 3
        else 5
      end
  ) as score
from deals d
left join (
  select deal_id, count(*) as click_count
  from deal_clicks
  where created_at > now() - interval '7 days'
  group by deal_id
) c on c.deal_id = d.id
left join (
  select deal_id, count(*) as fav_count
  from deal_favorites
  group by deal_id
) f on f.deal_id = d.id
where d.is_active = true
order by score desc;

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_deals_category   on deals(category);
create index if not exists idx_deals_regions    on deals using gin(regions);
create index if not exists idx_deals_store      on deals(affiliate_store);
create index if not exists idx_deals_active     on deals(is_active, expires_at);
create index if not exists idx_clicks_deal      on deal_clicks(deal_id);
create index if not exists idx_clicks_session   on deal_clicks(session_id);

-- ── Row-level security (enable after testing) ────────────────
alter table deals          enable row level security;
alter table deal_clicks    enable row level security;
alter table deal_favorites enable row level security;

-- Public read for deals
create policy "public read deals"
  on deals for select using (is_active = true);

-- Anyone can insert clicks/favorites (anonymous tracking)
create policy "public insert clicks"
  on deal_clicks for insert with check (true);

create policy "public insert favorites"
  on deal_favorites for insert with check (true);

create policy "public delete own favorites"
  on deal_favorites for delete using (session_id = current_setting('request.headers', true)::json->>'x-session-id');
