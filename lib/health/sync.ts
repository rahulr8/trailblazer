import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import { recalculateUserStats } from "@/lib/db/profiles";
import { DEFAULT_SYNC_DAYS } from "@/lib/constants";
import { mapWorkoutType, ensureHealthKitAuthorized } from "./config";

interface SyncResult {
  syncedCount: number;
  skippedCount: number;
}

type WorkoutSample = Awaited<ReturnType<typeof getHealthKitWorkouts>>[number];

// Distance quantity types to check, in priority order
const DISTANCE_TYPES = [
  "HKQuantityTypeIdentifierDistanceWalkingRunning",
  "HKQuantityTypeIdentifierDistanceCycling",
  "HKQuantityTypeIdentifierDistanceSwimming",
] as const;

async function getHealthKitWorkouts(since: Date) {
  if (Platform.OS !== "ios") return [] as const;

  console.log("[Health] Fetching workouts since:", since.toISOString());

  try {
    const HealthKit = await import("@kingstinct/react-native-healthkit");
    const workouts = await HealthKit.queryWorkoutSamples({
      filter: {
        date: {
          startDate: since,
        },
      },
      limit: -1,
      ascending: false,
    });

    console.log("[Health] Found", workouts.length, "workouts");
    return workouts;
  } catch (error) {
    console.error("[Health] Failed to fetch workouts:", error);
    throw error;
  }
}

async function getWorkoutDistanceKm(workout: WorkoutSample): Promise<number> {
  // getStatistic reads from workout.statistics(for:) which requires iOS 16+
  // workouts created with HKWorkoutBuilder. Explicit unit override ("m")
  // bypasses store.preferredUnits() which throws Code=5 when quantity type
  // authorization is "not determined".
  for (const distanceType of DISTANCE_TYPES) {
    try {
      const stat = await workout.getStatistic(distanceType, "m");
      if (stat?.sumQuantity?.quantity) {
        return Math.round((stat.sumQuantity.quantity / 1000) * 100) / 100;
      }
    } catch {
      // Statistic not available for this workout/type combination
    }
  }
  return 0;
}

async function getWorkoutElevationGain(workout: WorkoutSample): Promise<number | null> {
  // Prefer metadata elevation (direct sensor data, more accurate than flights × 3m)
  if (workout.metadataElevationAscended?.quantity) {
    return Math.round(workout.metadataElevationAscended.quantity * 100) / 100;
  }

  // Fall back to flights climbed statistic (≈3m per flight)
  try {
    const stat = await workout.getStatistic("HKQuantityTypeIdentifierFlightsClimbed", "count");
    if (stat?.sumQuantity?.quantity) {
      return Math.round(stat.sumQuantity.quantity * 3 * 100) / 100;
    }
  } catch {
    // Flights climbed not available
  }

  return null;
}

async function transformWorkout(workout: WorkoutSample) {
  const HealthKit = await import("@kingstinct/react-native-healthkit");
  const activityTypeName = HealthKit.WorkoutActivityType[workout.workoutActivityType] || "Workout";
  const durationSeconds = workout.duration?.quantity || 0;
  const elapsedTimeSeconds = Math.round(
    (workout.endDate.getTime() - workout.startDate.getTime()) / 1000,
  );

  const [distanceKm, elevationGain] = await Promise.all([
    getWorkoutDistanceKm(workout),
    getWorkoutElevationGain(workout),
  ]);

  return {
    source: "apple_health" as const,
    external_id: workout.uuid,
    type: mapWorkoutType(workout.workoutActivityType),
    name: activityTypeName,
    sport_type: activityTypeName,
    date: workout.startDate.toISOString(),
    duration: Math.round(durationSeconds),
    elapsed_time: elapsedTimeSeconds,
    distance: distanceKm,
    elevation_gain: elevationGain,
    location: null,
  };
}

export async function syncHealthWorkouts(
  uid: string,
  since?: Date,
): Promise<SyncResult> {
  console.log("[Health] Starting sync for user:", uid);

  await ensureHealthKitAuthorized();

  const syncStartDate = since || new Date(Date.now() - DEFAULT_SYNC_DAYS * 24 * 60 * 60 * 1000);
  const workouts = await getHealthKitWorkouts(syncStartDate);

  if (workouts.length === 0) {
    return { syncedCount: 0, skippedCount: 0 };
  }

  const rows = await Promise.all(
    workouts.map(async (w) => ({
      user_id: uid,
      ...(await transformWorkout(w)),
    })),
  );

  // Upsert updates existing rows on conflict to correct stale data
  const { data, error } = await supabase
    .from("activities")
    .upsert(rows, {
      onConflict: "user_id,source,external_id",
    })
    .select("id");

  if (error) throw error;

  const syncedCount = (data ?? []).length;
  const skippedCount = workouts.length - syncedCount;

  if (syncedCount > 0) {
    await recalculateUserStats(uid);

    const { error: syncError } = await supabase
      .from("health_connections")
      .upsert(
        {
          user_id: uid,
          is_authorized: true,
          last_sync_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    if (syncError) throw syncError;
  }

  console.log("[Health] Sync complete:", { syncedCount, skippedCount });
  return { syncedCount, skippedCount };
}
