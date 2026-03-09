import { supabase } from "@/lib/supabase";
import type { Activity, ActivitySource, LogActivityInput, QueryOptions } from "./types";

export async function logActivity(
  uid: string,
  input: LogActivityInput,
): Promise<number> {
  const { data, error } = await supabase.rpc("log_manual_activity", {
    p_user_id: uid,
    p_type: input.type,
    p_duration: input.duration,
    p_distance: input.distance,
    p_location: input.location,
  });

  if (error) throw error;
  return data as number;
}

function rowToActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as number,
    source: (row.source as ActivitySource) || "manual",
    externalId: (row.external_id as string) || null,
    type: row.type as string,
    duration: row.duration as number,
    distance: Number(row.distance),
    location: (row.location as string) || null,
    date: new Date(row.date as string),
    elapsedTime: row.elapsed_time as number | undefined,
    elevationGain: row.elevation_gain ? Number(row.elevation_gain) : undefined,
    name: row.name as string | undefined,
    sportType: row.sport_type as string | undefined,
  };
}

export async function getUserActivities(
  uid: string,
  options: QueryOptions = {},
): Promise<Activity[]> {
  let query = supabase
    .from("activities")
    .select()
    .eq("user_id", uid)
    .order("date", { ascending: options.orderByDate === "asc" });

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(rowToActivity);
}

export async function getRecentActivities(
  uid: string,
  limit: number = 3,
): Promise<Activity[]> {
  return getUserActivities(uid, { limit, orderByDate: "desc" });
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getWeeklyActivityCount(uid: string): Promise<number> {
  const startOfWeek = getStartOfWeek(new Date());

  const { count, error } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid)
    .gte("date", startOfWeek.toISOString());

  if (error) throw error;
  return count ?? 0;
}

export async function isEligibleForGiveaway(uid: string): Promise<boolean> {
  const count = await getWeeklyActivityCount(uid);
  return count >= 3;
}

export async function getActivityCountBySource(
  uid: string,
  source: ActivitySource,
): Promise<number> {
  const { count, error } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid)
    .eq("source", source);

  if (error) throw error;
  return count ?? 0;
}

export async function deleteActivitiesBySource(
  uid: string,
  source: ActivitySource,
): Promise<number> {
  const count = await getActivityCountBySource(uid, source);

  if (count === 0) return 0;

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("user_id", uid)
    .eq("source", source);

  if (error) throw error;
  return count;
}
