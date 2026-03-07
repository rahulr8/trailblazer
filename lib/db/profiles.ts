import { supabase } from "@/lib/supabase";
import type { Profile, UserStats, StatDeltas } from "./types";

export async function getUser(uid: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", uid)
    .single();

  if (error) return null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    photoUrl: data.photo_url,
    membershipTier: data.membership_tier as "free" | "platinum",
    totalKm: Number(data.total_km),
    totalMinutes: data.total_minutes,
    totalSteps: data.total_steps,
    currentStreak: data.current_streak,
    lastActivityDate: data.last_activity_date,
    upgradedAt: data.upgraded_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function userExists(uid: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", uid)
    .maybeSingle();

  return data !== null;
}

export async function getUserStats(uid: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("total_km, total_minutes, total_steps, current_streak")
    .eq("id", uid)
    .single();

  if (error) return null;

  return {
    totalKm: Number(data.total_km),
    totalMinutes: data.total_minutes,
    totalSteps: data.total_steps,
    currentStreak: data.current_streak,
  };
}

export async function incrementUserStats(
  uid: string,
  deltas: StatDeltas,
): Promise<void> {
  const { error } = await supabase.rpc("increment_user_stats", {
    p_user_id: uid,
    p_km_delta: deltas.km ?? 0,
    p_minutes_delta: deltas.minutes ?? 0,
    p_steps_delta: deltas.steps ?? 0,
  });
  if (error) throw error;
}

export async function updateStreak(uid: string): Promise<void> {
  const { error } = await supabase.rpc("update_streak", { p_user_id: uid });
  if (error) throw error;
}

export async function recalculateUserStats(uid: string): Promise<void> {
  const { error } = await supabase.rpc("recalculate_user_stats", { p_user_id: uid });
  if (error) throw error;
}

export async function updateMembershipTier(
  uid: string,
  tier: "free" | "platinum",
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ membership_tier: tier })
    .eq("id", uid);
  if (error) throw error;
}

export async function upgradeToPlatinum(uid: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      membership_tier: "platinum",
      upgraded_at: new Date().toISOString(),
    })
    .eq("id", uid);
  if (error) throw error;
}

export async function resetUserChallenge(uid: string): Promise<void> {
  const results = await Promise.all([
    supabase.from("activities").delete().eq("user_id", uid),
    supabase.from("saved_adventures").delete().eq("user_id", uid),
    supabase
      .from("profiles")
      .update({
        total_km: 0,
        total_minutes: 0,
        total_steps: 0,
        current_streak: 0,
        membership_tier: "free",
        last_activity_date: null,
      })
      .eq("id", uid),
  ]);

  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw firstError;
}
