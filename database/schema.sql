-- AxonProfile starter schema for Supabase. Run in Supabase SQL Editor.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
 bio text not null default '',
 avatar_url text,
 created_at timestamptz not null default now()
);
create table if not exists public.badges (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null,
 name text not null,
 description text not null default '',
 icon text not null default 'sparkles',
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.user_badges (
 user_id uuid not null references auth.users(id) on delete cascade,
 badge_id uuid not null references public.badges(id) on delete cascade,
 equipped boolean not null default false,
 awarded_by uuid references auth.users(id),
 awarded_at timestamptz not null default now(),
 primary key(user_id,badge_id)
);
create table if not exists public.badge_codes (
 id uuid primary key default gen_random_uuid(),
 code_hash text unique not null,
 badge_id uuid references public.badges(id) on delete cascade,
 custom_badge_name text,
 custom_badge_description text,
 max_uses integer not null default 1 check(max_uses > 0),
 uses integer not null default 0 check(uses >= 0),
 expires_at timestamptz,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 check ((badge_id is not null) or (custom_badge_name is not null))
);
create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.badge_codes enable row level security;
alter table public.admin_users enable row level security;
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Active badges are readable" on public.badges for select using (is_active = true);
create policy "Users can read own awarded badges" on public.user_badges for select using (auth.uid() = user_id);
-- IMPORTANT: badge code redemption and admin mutations must be implemented as server-side RPC/Edge Functions.
-- Do not add a public SELECT policy for badge_codes or allow users to write admin_users.


-- Moderation ban records. All access is server-side via the service-role key.
create table if not exists public.bans (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 username text,
 reason text not null,
 created_at timestamptz not null default now(),
 expires_at timestamptz,
 active boolean not null default true,
 lifted_at timestamptz
);
create index if not exists bans_user_active_idx on public.bans(user_id, active);
alter table public.bans enable row level security;
-- Intentionally no client policies for bans; only the trusted server route uses service role.
