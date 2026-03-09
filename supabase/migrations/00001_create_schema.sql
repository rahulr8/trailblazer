-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (replaces Firestore users/{uid})
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  photo_url text,
  membership_tier text not null default 'free'
    check (membership_tier in ('free', 'platinum')),
  total_km numeric(10,2) not null default 0,
  total_minutes integer not null default 0,
  total_steps integer not null default 0,
  current_streak integer not null default 0,
  last_activity_date timestamptz,
  upgraded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Health connections (extracted from nested Firestore field)
create table public.health_connections (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_authorized boolean not null default false,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  unique(user_id)
);

-- Activities (replaces Firestore users/{uid}/activities)
create table public.activities (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('manual', 'apple_health')),
  external_id text,
  type text not null,
  duration integer not null,
  distance numeric(10,3) not null default 0,
  location text,
  date timestamptz not null,
  elapsed_time integer,
  elevation_gain numeric(8,2),
  name text,
  sport_type text,
  created_at timestamptz not null default now(),
  unique(user_id, source, external_id)
);

-- Saved adventures (replaces Firestore users/{uid}/savedAdventures)
create table public.saved_adventures (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  adventure_id text not null,
  adventure_data jsonb not null,
  saved_at timestamptz not null default now(),
  unique(user_id, adventure_id)
);

-- Conversations (replaces Firestore conversations/{sessionId})
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  message_count integer not null default 0
);

-- Messages (replaces Firestore conversations/{sessionId}/messages)
create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- FK indexes (Postgres does NOT auto-index FKs)
create index health_connections_user_id_idx on health_connections (user_id);
create index activities_user_id_idx on activities (user_id);
create index saved_adventures_user_id_idx on saved_adventures (user_id);
create index conversations_user_id_idx on conversations (user_id);
create index messages_conversation_id_idx on messages (conversation_id);

-- Composite indexes for common query patterns
create index activities_user_date_idx on activities (user_id, date desc);
create index activities_user_source_idx on activities (user_id, source);
create index messages_conversation_time_idx on messages (conversation_id, created_at);

-- Partial index for Apple Health deduplication
create index activities_dedup_idx on activities (user_id, external_id)
  where external_id is not null;

-- ============================================================
-- ROW LEVEL SECURITY
-- All policies use (select auth.uid()) for cached evaluation
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy profiles_select on profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update on profiles
  for update to authenticated
  using ((select auth.uid()) = id);

-- Health connections
alter table public.health_connections enable row level security;
alter table public.health_connections force row level security;

create policy health_connections_all on health_connections
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Activities
alter table public.activities enable row level security;
alter table public.activities force row level security;

create policy activities_select on activities
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy activities_insert on activities
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy activities_update on activities
  for update to authenticated
  using ((select auth.uid()) = user_id);

create policy activities_delete on activities
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Saved adventures
alter table public.saved_adventures enable row level security;
alter table public.saved_adventures force row level security;

create policy saved_adventures_all on saved_adventures
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Conversations
alter table public.conversations enable row level security;
alter table public.conversations force row level security;

create policy conversations_own on conversations
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy conversations_anon_insert on conversations
  for insert to anon
  with check (user_id is null);

-- Messages
alter table public.messages enable row level security;
alter table public.messages force row level security;

create policy messages_own on messages
  for all to authenticated
  using (
    conversation_id in (
      select id from conversations where user_id = (select auth.uid())
    )
  );

create policy messages_anon_read on messages
  for select to anon
  using (
    conversation_id in (
      select id from conversations where user_id is null
    )
  );

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic stats increment (replaces Firestore increment())
create or replace function public.increment_user_stats(
  p_user_id uuid,
  p_km_delta numeric default 0,
  p_minutes_delta integer default 0,
  p_steps_delta integer default 0
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set
    total_km = total_km + p_km_delta,
    total_minutes = total_minutes + p_minutes_delta,
    total_steps = total_steps + p_steps_delta,
    updated_at = now()
  where id = p_user_id;
$$;

-- Recalculate all stats from activities
create or replace function public.recalculate_user_stats(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total_km numeric;
  v_total_minutes integer;
  v_total_steps integer;
  v_last_date timestamptz;
  v_streak integer := 0;
  v_check_date date;
  v_has_activity boolean;
begin
  select
    coalesce(sum(distance), 0),
    coalesce(sum(duration) / 60, 0),
    coalesce(sum(
      case when type in ('walk', 'hike', 'run') and distance > 0 then round(distance * 1300) else 0 end
    ), 0),
    max(date)
  into v_total_km, v_total_minutes, v_total_steps, v_last_date
  from public.activities
  where user_id = p_user_id;

  -- Calculate streak from today backwards
  if v_last_date is not null then
    v_check_date := current_date;
    loop
      select exists(
        select 1 from public.activities
        where user_id = p_user_id and date::date = v_check_date
      ) into v_has_activity;

      if v_has_activity then
        v_streak := v_streak + 1;
        v_check_date := v_check_date - 1;
      else
        -- Allow today to have no activity if yesterday did
        if v_streak = 0 then
          v_check_date := v_check_date - 1;
          select exists(
            select 1 from public.activities
            where user_id = p_user_id and date::date = v_check_date
          ) into v_has_activity;
          if v_has_activity then
            v_streak := 1;
            v_check_date := v_check_date - 1;
            continue;
          end if;
        end if;
        exit;
      end if;
    end loop;
  end if;

  update public.profiles
  set
    total_km = v_total_km,
    total_minutes = v_total_minutes,
    total_steps = v_total_steps,
    current_streak = v_streak,
    last_activity_date = v_last_date,
    updated_at = now()
  where id = p_user_id;
end;
$$;

-- Update streak logic
create or replace function public.update_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_last_date date;
  v_today date := current_date;
begin
  select last_activity_date::date into v_last_date
  from public.profiles where id = p_user_id;

  if v_last_date = v_today then
    return;
  elsif v_last_date = v_today - 1 then
    update public.profiles
    set current_streak = current_streak + 1,
        last_activity_date = now(),
        updated_at = now()
    where id = p_user_id;
  else
    update public.profiles
    set current_streak = 1,
        last_activity_date = now(),
        updated_at = now()
    where id = p_user_id;
  end if;
end;
$$;

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
