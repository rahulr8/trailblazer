-- Drop the old one-argument update_streak (insecure, no auth check)
-- The two-argument version from 00004 replaces it
drop function if exists public.update_streak(uuid);

-- Fix: use coalesced date for writes (not raw p_activity_date which may be null)
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
