# Home Activity Stats Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace home screen mock activity stats/cards with real data from Supabase `profiles` and `activities`.

**Architecture:** Keep fetching at the home screen boundary, where auth and pull-to-refresh already exist. Move activity-derived display values behind a small home-specific view model so `HeroSwiper` and `StatsFlipCard` become presentational components that accept explicit props instead of importing mocks.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase JS, Bun test runner for lightweight unit tests, Expo lint, TypeScript compiler.

---

### Task 1: Add a home stats view model and test its behavior

**Files:**
- Create: `lib/home/activity-stats.ts`
- Create: `lib/home/activity-stats.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, test } from "bun:test";

import { buildHomeActivityStats, formatMinutesActive } from "@/lib/home/activity-stats";

describe("buildHomeActivityStats", () => {
  test("maps profile stats and activity count into card values", () => {
    expect(
      buildHomeActivityStats({
        currentStreak: 4,
        totalMinutes: 125,
        totalActivities: 7,
      })
    ).toEqual({
      currentStreak: 4,
      natureScore: 6,
      totalActivities: 7,
      totalMinutes: 125,
    });
  });
});

describe("formatMinutesActive", () => {
  test("formats minutes as hours and zero-padded minutes", () => {
    expect(formatMinutesActive(125)).toBe("2h 05m");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/home/activity-stats.test.ts`
Expected: FAIL because `lib/home/activity-stats.ts` does not exist yet.

**Step 3: Write minimal implementation**

```ts
export interface HomeActivityStats {
  currentStreak: number;
  natureScore: number;
  totalActivities: number;
  totalMinutes: number;
}

interface BuildInput {
  currentStreak: number;
  totalActivities: number;
  totalMinutes: number;
}

export function buildHomeActivityStats(input: BuildInput): HomeActivityStats {
  return {
    currentStreak: input.currentStreak,
    natureScore: Math.round(input.totalMinutes * 0.05),
    totalActivities: input.totalActivities,
    totalMinutes: input.totalMinutes,
  };
}

export function formatMinutesActive(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}
```

**Step 4: Run test to verify it passes**

Run: `bun test lib/home/activity-stats.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/home/activity-stats.ts lib/home/activity-stats.test.ts
git commit -m "test: add home activity stats view model"
```

### Task 2: Load real home activity stats in the dashboard screen

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `lib/db/activities.ts`
- Modify: `lib/db/profiles.ts`
- Modify: `lib/db/types.ts`
- Modify: `lib/home/activity-stats.ts`

**Step 1: Write the failing test**

Write one additional unit test in `lib/home/activity-stats.test.ts` that proves the view model falls back to zero values when the source data is missing.

```ts
test("normalizes missing values to zero", () => {
  expect(
    buildHomeActivityStats({
      currentStreak: 0,
      totalMinutes: 0,
      totalActivities: 0,
    })
  ).toEqual({
    currentStreak: 0,
    natureScore: 0,
    totalActivities: 0,
    totalMinutes: 0,
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/home/activity-stats.test.ts`
Expected: FAIL until the normalizing behavior is implemented.

**Step 3: Write minimal implementation**

Implement the home screen loader:

- Add `uid` via `useAuth()`.
- Fetch `getUserStats(uid)` and a lightweight activity count helper in parallel.
- Build a `HomeActivityStats` object and store it in screen state.
- Refresh both affirmation and Supabase-backed stats in `onRefresh`.
- Show a toast if the refresh fails.
- Return zeroed stats when `uid` or fetch results are unavailable.

**Step 4: Run test to verify it passes**

Run: `bun test lib/home/activity-stats.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add app/'(tabs)'/index.tsx lib/db/activities.ts lib/db/profiles.ts lib/db/types.ts lib/home/activity-stats.ts lib/home/activity-stats.test.ts
git commit -m "feat: load home activity stats from supabase"
```

### Task 3: Convert home cards to consume explicit real-data props

**Files:**
- Modify: `components/home/HeroSwiper.tsx`
- Modify: `components/home/StatsFlipCard.tsx`
- Modify: `components/home/CLAUDE.md`

**Step 1: Write the failing test**

Add a formatting assertion in `lib/home/activity-stats.test.ts` covering zero minutes:

```ts
test("formats zero minutes", () => {
  expect(formatMinutesActive(0)).toBe("0h 00m");
});
```

**Step 2: Run test to verify it fails**

Run: `bun test lib/home/activity-stats.test.ts`
Expected: FAIL until formatting handles the zero case exactly.

**Step 3: Write minimal implementation**

- Update `HeroSwiper` to accept the counter minutes as a prop and stop importing `MOCK_HERO_CARDS`.
- Update `StreakFlipCard` to accept `currentStreak`.
- Update `NatureScoreFlipCard` to accept `natureScore`, `totalMinutes`, and `totalActivities`.
- Keep visual styling unchanged except for using safe placeholder or zero values.
- Refresh component docs to describe the new prop-based data contract.

**Step 4: Run test to verify it passes**

Run: `bun test lib/home/activity-stats.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add components/home/HeroSwiper.tsx components/home/StatsFlipCard.tsx components/home/CLAUDE.md lib/home/activity-stats.test.ts
git commit -m "feat: wire home cards to real activity stats"
```

### Task 4: Run full verification

**Files:**
- Modify: none

**Step 1: Run unit tests**

Run: `bun test lib/home/activity-stats.test.ts`
Expected: PASS

**Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: PASS

**Step 3: Run lint**

Run: `bunx expo lint`
Expected: PASS

**Step 4: Review diff**

Run: `git diff --stat`
Expected: Only the planned home stats files changed.

**Step 5: Commit**

```bash
git add app/'(tabs)'/index.tsx components/home/HeroSwiper.tsx components/home/StatsFlipCard.tsx components/home/CLAUDE.md lib/db/activities.ts lib/db/profiles.ts lib/db/types.ts lib/home/activity-stats.ts lib/home/activity-stats.test.ts docs/plans/2026-03-09-home-activity-stats-design.md docs/plans/2026-03-09-home-activity-stats.md
git commit -m "feat: replace home mock stats with activity data"
```
