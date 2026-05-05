-- Users (anoniem of met email)
create table users (
  id uuid primary key default gen_random_uuid(),
  anon_id uuid unique not null,
  email text unique,
  email_verified boolean default false,
  created_at timestamptz default now(),
  last_check_at timestamptz,
  marketing_opt_in boolean default false,
  reminder_opt_in boolean default false
);

create index idx_users_anon_id on users(anon_id);
create index idx_users_email on users(email);

-- Checks (resultaten van een BespaarCheck-sessie)
create table checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  answers jsonb not null,                    -- { energie: {...}, bank: {...} }
  results jsonb not null,                    -- berekende besparingen per categorie
  total_savings numeric(10,2),               -- totaal in euro per jaar
  score numeric(3,1),                        -- 0-10
  share_id text unique,                      -- voor shareable URLs (later)
  created_at timestamptz default now()
);

create index idx_checks_user on checks(user_id);
create index idx_checks_share on checks(share_id);

-- Acties (tracking van wat user doet)
create table actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  check_id uuid references checks(id) on delete set null,
  category text,                             -- 'vpn', 'bank', etc.
  provider text,                             -- 'nordvpn', 'bunq', etc.
  action_type text not null,                 -- 'affiliate_click', 'marked_done', 'email_optin'
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_actions_user on actions(user_id);

-- Row Level Security
alter table users enable row level security;
alter table checks enable row level security;
alter table actions enable row level security;

-- Policies: open voor MVP, later strikter
create policy "Users can read own record by anon_id"
  on users for select
  using (true);

create policy "Users can insert own record"
  on users for insert
  with check (true);

create policy "Users can update own record by anon_id"
  on users for update
  using (true);

create policy "Anyone can read own checks"
  on checks for select
  using (true);

create policy "Anyone can insert checks"
  on checks for insert
  with check (true);

create policy "Anyone can insert actions"
  on actions for insert
  with check (true);
