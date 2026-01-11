import { Platform } from "react-native";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/db/utils";
import { incrementUserStats, updateStreak } from "@/lib/db/users";
import { calculateSteps, DEFAULT_SYNC_DAYS } from "@/lib/constants";
import { mapWorkoutType, ensureHealthKitAuthorized } from "./config";

interface SyncResult {
  syncedCount: number;
  skippedCount: number;
}

// Get workouts from HealthKit using dynamic import
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

// Check if workout already exists in Firestore (by externalId)
async function workoutExists(uid: string, externalId: string): Promise<boolean> {
  const activitiesRef = collection(db, collections.activities(uid));
  const q = query(
    activitiesRef,
    where("source", "==", "apple_health"),
    where("externalId", "==", externalId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Transform HealthKit workout to ActivityDocument format
async function transformWorkout(workout: Awaited<ReturnType<typeof getHealthKitWorkouts>>[number]) {
  const durationSeconds = workout.duration?.quantity || 0;

  // Try to get distance from workout statistics (try each type individually)
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

  // Get workout activity type name dynamically
  const HealthKit = await import("@kingstinct/react-native-healthkit");
  const activityTypeName = HealthKit.WorkoutActivityType[workout.workoutActivityType] || "Workout";

  return {
    source: "apple_health" as const,
    externalId: workout.uuid,
    type: mapWorkoutType(workout.workoutActivityType),
    duration: Math.round(durationSeconds),
    distance: Math.round(distanceKm * 100) / 100,
    location: null,
    date: Timestamp.fromDate(workout.startDate),
    createdAt: serverTimestamp(),
    name: activityTypeName,
    sportType: activityTypeName,
  };
}

// Sync workouts from HealthKit to Firestore
export async function syncHealthWorkouts(
  uid: string,
  since?: Date
): Promise<SyncResult> {
  console.log("[Health] Starting sync for user:", uid);

  // Ensure we have HealthKit authorization before attempting to fetch
  // This will re-request if needed or throw if denied
  await ensureHealthKitAuthorized();

  const syncStartDate = since || new Date(Date.now() - DEFAULT_SYNC_DAYS * 24 * 60 * 60 * 1000);

  const workouts = await getHealthKitWorkouts(syncStartDate);

  let syncedCount = 0;
  let skippedCount = 0;
  let totalKm = 0;
  let totalMinutes = 0;
  let totalSteps = 0;

  for (const workout of workouts) {
    const activity = await transformWorkout(workout);
    const exists = await workoutExists(uid, activity.externalId);

    if (exists) {
      skippedCount++;
      continue;
    }

    const activitiesRef = collection(db, collections.activities(uid));
    await addDoc(activitiesRef, activity);

    totalKm += activity.distance;
    totalMinutes += Math.round(activity.duration / 60);
    totalSteps += calculateSteps(activity.type, activity.distance);

    syncedCount++;
  }

  if (syncedCount > 0) {
    await incrementUserStats(uid, {
      km: totalKm,
      minutes: totalMinutes,
      steps: totalSteps,
    });

    await updateStreak(uid);

    await updateDoc(doc(db, collections.users, uid), {
      "healthConnection.lastSyncAt": serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  console.log("[Health] Sync complete:", { syncedCount, skippedCount });
  return { syncedCount, skippedCount };
}
