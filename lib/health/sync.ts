import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import { recalculateUserStats } from "@/lib/db/profiles";
import { DEFAULT_SYNC_DAYS } from "@/lib/constants";
import { mapWorkoutType, ensureHealthKitAuthorized } from "./config";

interface SyncResult {
  syncedCount: number;
  skippedCount: number;
}

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

async function transformWorkout(workout: Awaited<ReturnType<typeof getHealthKitWorkouts>>[number]) {
  const durationSeconds = workout.duration?.quantity || 0;

  const elapsedTimeSeconds = Math.round(
    (workout.endDate.getTime() - workout.startDate.getTime()) / 1000
  );

  let distanceKm = 0;
  const distanceTypes = [
    "HKQuantityTypeIdentifierDistanceWalkingRunning",
    "HKQuantityTypeIdentifierDistanceCycling",
    "HKQuantityTypeIdentifierDistanceSwimming",
  ] as const;

  for (const distanceType of distanceTypes) {
    try {
      const stat = await workout.getStatistic(distanceType);
      if (stat?.sumQuantity?.quantity) {
        distanceKm = stat.sumQuantity.quantity / 1000;
        break;
      }
    } catch {
      // Permission not granted for this type, try next
    }
  }

  let elevationGain: number | null = null;
  try {
    const flightsStat = await workout.getStatistic("HKQuantityTypeIdentifierFlightsClimbed");
    if (flightsStat?.sumQuantity?.quantity) {
      elevationGain = Math.round(flightsStat.sumQuantity.quantity * 3 * 100) / 100;
    }
  } catch {
    // Flights climbed not available for this workout type
  }

  const HealthKit = await import("@kingstinct/react-native-healthkit");
  const activityTypeName = HealthKit.WorkoutActivityType[workout.workoutActivityType] || "Workout";

  return {
    source: "apple_health" as const,
    external_id: workout.uuid,
    type: mapWorkoutType(workout.workoutActivityType),
    duration: Math.round(durationSeconds),
    distance: Math.round(distanceKm * 100) / 100,
    elapsed_time: elapsedTimeSeconds,
    elevation_gain: elevationGain,
    location: null,
    date: workout.startDate.toISOString(),
    name: activityTypeName,
    sport_type: activityTypeName,
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
    workouts.map(async (w) => {
      const transformed = await transformWorkout(w);
      return {
        user_id: uid,
        ...transformed,
      };
    }),
  );

  // Batch insert with ON CONFLICT DO NOTHING for deduplication
  const { data, error } = await supabase
    .from("activities")
    .upsert(rows, {
      onConflict: "user_id,source,external_id",
      ignoreDuplicates: true,
    })
    .select("id, external_id");

  if (error) throw error;

  const insertedExternalIds = new Set((data ?? []).map((r) => r.external_id));
  const syncedCount = insertedExternalIds.size;
  const skippedCount = workouts.length - syncedCount;

  if (syncedCount > 0) {
    // Recalculate all stats from actual activity data to avoid
    // rounding drift and streak corruption from historical dates
    await recalculateUserStats(uid);

    // Update last sync timestamp on health_connections
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
