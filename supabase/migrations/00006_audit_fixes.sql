-- Migration: 00006_audit_fixes.sql
-- Fixes multiple issues found in a Postgres best practices audit:
--   1. update_updated_at: add set search_path = '' to prevent search_path injection
--   2. increment_message_count: atomic RPC to fix message count race condition
--   3. reset_user_challenge: wrap 3 operations in a transaction via plpgsql
--   4. log_manual_activity: single RPC replacing 3 sequential client calls
--   5. recalculate_user_stats: set-based streak calculation (fixes N+1 loop + date cast)
--   6. messages_own RLS: replace IN with EXISTS for performance
--   7. messages_anon_read RLS: drop overly broad anon read policy

-- 1. Fix update_updated_at missing search_path
create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Create increment_message_count RPC (fixes race condition in conversations)
create or replace function public.increment_message_count(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.conversations
  set message_count = message_count + 1,
      last_message_at = now()
  where id = p_conversation_id
    and user_id = (select auth.uid());
$$;

-- 3. Create reset_user_challenge RPC (wraps 3 operations in a transaction)
create or replace function public.reset_user_challenge(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id != (select auth.uid()) then
    raise exception 'Not authorized';
  end if;

  delete from public.activities where user_id = p_user_id;
  delete from public.saved_adventures where user_id = p_user_id;
  update public.profiles set
    total_km = 0, total_minutes = 0, total_steps = 0,
    current_streak = 0, membership_tier = 'free',
    last_activity_date = null, updated_at = now()
  where id = p_user_id;
end;
$$;

-- 4. Create log_manual_activity RPC (replaces 3 sequential calls)
create or replace function public.log_manual_activity(
  p_user_id uuid,
  p_type text,
  p_duration integer,
  p_distance numeric,
  p_location text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity_id bigint;
  v_steps integer;
begin
  if p_user_id != (select auth.uid()) then
    raise exception 'Not authorized';
  end if;

  insert into public.activities (user_id, source, type, duration, distance, location, date)
  values (p_user_id, 'manual', p_type, p_duration, p_distance, p_location, now())
  returning id into v_activity_id;

  -- Calculate steps: 1300 steps/km for walk/hike/run
  v_steps := case when p_type in ('walk', 'hike', 'run') and p_distance > 0
    then round(p_distance * 1300)
    else 0
  end;

  update public.profiles
  set
    total_km = total_km + p_distance,
    total_minutes = total_minutes + round(p_duration::numeric / 60),
    total_steps = total_steps + v_steps,
    updated_at = now()
  where id = p_user_id;

  -- Update streak
  perform public.update_streak(p_user_id, now());

  return v_activity_id;
end;
$$;

-- 5. Rewrite recalculate_user_stats with set-based streak (fixes N+1 loop + date::date cast)
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
begin
  if p_user_id != (select auth.uid()) then
    raise exception 'Not authorized';
  end if;

  select
    coalesce(sum(distance), 0),
    coalesce(round(sum(duration)::numeric / 60), 0)::integer,
    coalesce(sum(
      case when type in ('walk', 'hike', 'run') and distance > 0 then round(distance * 1300) else 0 end
    ), 0),
    max(date)
  into v_total_km, v_total_minutes, v_total_steps, v_last_date
  from public.activities
  where user_id = p_user_id;

  -- Set-based streak calculation using window functions (replaces N+1 loop)
  if v_last_date is not null then
    with daily_activities as (
      select distinct date(date at time zone 'UTC') as activity_date
      from public.activities
      where user_id = p_user_id
    ),
    with_gaps as (
      select
        activity_date,
        activity_date - (row_number() over (order by activity_date desc))::int as grp
      from daily_activities
    ),
    streak_groups as (
      select grp, count(*) as streak_len, max(activity_date) as latest_date
      from with_gaps
      group by grp
    )
    select streak_len into v_streak
    from streak_groups
    where latest_date >= current_date - 1
    order by latest_date desc
    limit 1;

    v_streak := coalesce(v_streak, 0);
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

-- 6. Fix messages_own RLS: replace IN with EXISTS
drop policy if exists messages_own on messages;
create policy messages_own on messages
  for all to authenticated
  using (
    exists (
      select 1 from public.conversations
      where id = messages.conversation_id
      and user_id = (select auth.uid())
    )
  );

-- 7. Fix messages_anon_read RLS: drop overly broad policy
-- Drop overly broad anon read policy. Anonymous message reads should go through
-- edge functions with service_role key, not direct client access.
drop policy if exists messages_anon_read on messages;
