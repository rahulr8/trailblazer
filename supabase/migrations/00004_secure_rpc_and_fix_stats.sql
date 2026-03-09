-- ============================================================
-- P0: Secure RPC functions with auth.uid() checks
-- P2: Fix stats rounding drift (round() instead of integer division)
-- P1: Fix streak corruption by accepting activity date param
-- ============================================================

-- Atomic stats increment: enforce caller can only update own stats
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
  where id = p_user_id
    and p_user_id = (select auth.uid());
$$;

-- Recalculate all stats from activities: enforce caller can only recalculate own stats
-- Also fixes P2 rounding drift: uses round() to match JS Math.round() behavior
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
  -- Auth check
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

-- Update streak: enforce caller can only update own streak
-- Now accepts optional p_activity_date to correctly handle historical syncs
create or replace function public.update_streak(
  p_user_id uuid,
  p_activity_date timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_last_date date;
  v_activity_date date := coalesce(p_activity_date::date, current_date);
begin
  -- Auth check
  if p_user_id != (select auth.uid()) then
    raise exception 'Not authorized';
  end if;

  select last_activity_date::date into v_last_date
  from public.profiles where id = p_user_id;

  if v_last_date = v_activity_date then
    return;
  elsif v_last_date = v_activity_date - 1 then
    update public.profiles
    set current_streak = current_streak + 1,
        last_activity_date = v_activity_date,
        updated_at = now()
    where id = p_user_id;
  else
    update public.profiles
    set current_streak = 1,
        last_activity_date = v_activity_date,
        updated_at = now()
    where id = p_user_id;
  end if;
end;
$$;
