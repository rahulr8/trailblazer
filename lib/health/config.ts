import { Platform } from "react-native";
import type { WorkoutActivityType } from "@kingstinct/react-native-healthkit";

// Re-export WorkoutActivityType enum values for mapping
// Using numeric values directly to avoid static import of native module
const WorkoutActivityTypeValues = {
  running: 37,
  hiking: 24,
  cycling: 13,
  walking: 52,
  swimming: 46,
  paddleSports: 31,
  rowing: 35,
  snowSports: 44,
  crossCountrySkiing: 12,
  downhillSkiing: 14,
  snowboarding: 43,
  functionalStrengthTraining: 20,
  traditionalStrengthTraining: 50,
  crossTraining: 11,
  highIntensityIntervalTraining: 25,
  yoga: 54,
  pilates: 32,
} as const;

// Map HealthKit workout activity types to app activity types
export function mapWorkoutType(activityType: WorkoutActivityType | number): string {
  const workoutTypeMap: Record<number, string> = {
    [WorkoutActivityTypeValues.running]: "run",
    [WorkoutActivityTypeValues.hiking]: "hike",
    [WorkoutActivityTypeValues.cycling]: "bike",
    [WorkoutActivityTypeValues.walking]: "walk",
    [WorkoutActivityTypeValues.swimming]: "swim",
    [WorkoutActivityTypeValues.paddleSports]: "paddle",
    [WorkoutActivityTypeValues.rowing]: "paddle",
    [WorkoutActivityTypeValues.snowSports]: "snow",
    [WorkoutActivityTypeValues.crossCountrySkiing]: "snow",
    [WorkoutActivityTypeValues.downhillSkiing]: "snow",
    [WorkoutActivityTypeValues.snowboarding]: "snow",
    [WorkoutActivityTypeValues.functionalStrengthTraining]: "workout",
    [WorkoutActivityTypeValues.traditionalStrengthTraining]: "workout",
    [WorkoutActivityTypeValues.crossTraining]: "workout",
    [WorkoutActivityTypeValues.highIntensityIntervalTraining]: "workout",
    [WorkoutActivityTypeValues.yoga]: "workout",
    [WorkoutActivityTypeValues.pilates]: "workout",
  };

  return workoutTypeMap[activityType] || "other";
}

// Re-export from shared constants for backwards compatibility
export { STEP_COUNTING_ACTIVITIES as STEPS_ACTIVITY_TYPES, DEFAULT_SYNC_DAYS } from "@/lib/constants";

// HealthKit availability check (async to avoid native crash)
export async function isHealthKitAvailableAsync(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    console.log("[Health] Not available - not iOS");
    return false;
  }
  try {
    console.log("[Health] Checking availability...");
    const HealthKit = await import("@kingstinct/react-native-healthkit");
    const available = await HealthKit.isHealthDataAvailableAsync();
    console.log("[Health] Availability check result:", available);
    return available;
  } catch (error) {
    console.error("[Health] Availability check failed:", error);
    return false;
  }
}

// The permissions we need to request
const HEALTHKIT_READ_PERMISSIONS = [
  "HKWorkoutTypeIdentifier",
  "HKQuantityTypeIdentifierDistanceWalkingRunning",
  "HKQuantityTypeIdentifierDistanceCycling",
  "HKQuantityTypeIdentifierDistanceSwimming",
] as const;

// Initialize HealthKit with permissions
export async function initHealthKit(): Promise<void> {
  console.log("[Health] initHealthKit called");

  if (Platform.OS !== "ios") {
    throw new Error("Apple Health is only available on iOS");
  }

  // Verify HealthKit is available before attempting authorization
  const isAvailable = await isHealthKitAvailableAsync();
  if (!isAvailable) {
    throw new Error("HealthKit is not available on this device");
  }

  try {
    console.log("[Health] Requesting authorization via dynamic import...");
    const HealthKit = await import("@kingstinct/react-native-healthkit");
    console.log("[Health] Module loaded, calling requestAuthorization...");

    const authorized = await HealthKit.requestAuthorization({
      toRead: [...HEALTHKIT_READ_PERMISSIONS],
      toShare: [],
    });

    console.log("[Health] Authorization result:", authorized);

    if (!authorized) {
      throw new Error("HealthKit authorization denied");
    }

    console.log("[Health] Authorization successful");
  } catch (error) {
    console.error("[Health] Authorization error:", error);
    throw error;
  }
}

// Ensure HealthKit is authorized before syncing
// This re-requests authorization if needed (iOS shows dialog only if not determined)
export async function ensureHealthKitAuthorized(): Promise<void> {
  console.log("[Health] Ensuring authorization...");

  if (Platform.OS !== "ios") {
    throw new Error("Apple Health is only available on iOS");
  }

  const isAvailable = await isHealthKitAvailableAsync();
  if (!isAvailable) {
    throw new Error("HealthKit is not available on this device");
  }

  try {
    const HealthKit = await import("@kingstinct/react-native-healthkit");

    // requestAuthorization is idempotent - it will:
    // - Show dialog if authorization is "not determined"
    // - Return immediately if already authorized
    // - Return false if previously denied (user must go to Settings)
    const authorized = await HealthKit.requestAuthorization({
      toRead: [...HEALTHKIT_READ_PERMISSIONS],
      toShare: [],
    });

    console.log("[Health] Authorization check result:", authorized);

    if (!authorized) {
      throw new Error(
        "HealthKit authorization denied. Please enable in Settings > Privacy & Security > Health > Trailblazer"
      );
    }
  } catch (error) {
    console.error("[Health] Authorization check error:", error);
    throw error;
  }
}
