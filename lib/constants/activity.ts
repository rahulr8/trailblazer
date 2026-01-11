import type { ActivitySource } from "@/lib/db/types";

export const STEPS_PER_KM = 1300;

export const STEP_COUNTING_ACTIVITIES = ["walk", "hike", "run"] as const;

export type StepCountingActivity = (typeof STEP_COUNTING_ACTIVITIES)[number];

export function calculateSteps(
  activityType: string,
  distanceKm: number
): number {
  const stepsActivities: readonly string[] = STEP_COUNTING_ACTIVITIES;
  if (!stepsActivities.includes(activityType)) return 0;
  return Math.round(distanceKm * STEPS_PER_KM);
}

export const DEFAULT_SYNC_DAYS = 30;
