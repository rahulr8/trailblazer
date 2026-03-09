export interface HomeActivityStats {
  currentStreak: number;
  natureScore: number;
  totalActivities: number;
  totalMinutes: number;
  weeklyActivities: number;
}

interface BuildHomeActivityStatsInput {
  currentStreak?: number | null;
  totalActivities?: number | null;
  totalMinutes?: number | null;
  weeklyActivities?: number | null;
}

function normalizeCount(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function buildHomeActivityStats(
  input: BuildHomeActivityStatsInput,
): HomeActivityStats {
  const totalMinutes = normalizeCount(input.totalMinutes);

  return {
    currentStreak: normalizeCount(input.currentStreak),
    natureScore: Math.round(totalMinutes * 0.05),
    totalActivities: normalizeCount(input.totalActivities),
    totalMinutes,
    weeklyActivities: normalizeCount(input.weeklyActivities),
  };
}

export function formatMinutesActive(totalMinutes: number): string {
  const normalizedMinutes = normalizeCount(totalMinutes);
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}
