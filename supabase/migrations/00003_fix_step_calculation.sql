-- Fix step calculation to only count steps for walk/hike/run activities
-- and use 1300 steps/km multiplier (matching STEPS_PER_KM in lib/constants/activity.ts)
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
