# Home Activity Stats Design

## Goal

Replace the home dashboard's activity-derived mock values with real data from Supabase now that Apple Health workouts are syncing into the `activities` table.

## Scope

- Replace mock values used by the home hero counter card.
- Replace mock values used by the home streak and nature score flip cards.
- Keep non-activity content unchanged, including affirmations, avatar usage, and leaderboard placeholders.

## Current State

- [`app/(tabs)/index.tsx`](/Users/turbolaunch/Apps/corvus-tech/bc-parks-foundation/trailblazer/app/(tabs)/index.tsx) renders the home screen and currently passes only mock-driven data into the dashboard.
- [`components/home/HeroSwiper.tsx`](/Users/turbolaunch/Apps/corvus-tech/bc-parks-foundation/trailblazer/components/home/HeroSwiper.tsx) reads `MOCK_HERO_CARDS` internally.
- [`components/home/StatsFlipCard.tsx`](/Users/turbolaunch/Apps/corvus-tech/bc-parks-foundation/trailblazer/components/home/StatsFlipCard.tsx) reads `MOCK_STATS` internally.
- [`lib/db/activities.ts`](/Users/turbolaunch/Apps/corvus-tech/bc-parks-foundation/trailblazer/lib/db/activities.ts) and [`lib/db/profiles.ts`](/Users/turbolaunch/Apps/corvus-tech/bc-parks-foundation/trailblazer/lib/db/profiles.ts) already expose the Supabase queries needed for totals and streak.

## Proposed Approach

Use a small home-specific data loader that combines profile stats with activity counts, and pass the resulting values into the existing UI components.

- `profiles.current_streak` and `profiles.total_minutes` remain the source of truth for streak and minutes.
- `activities` becomes the source of truth for total session count.
- The home screen owns loading, refreshing, and error handling.
- The presentational components stop importing mock activity data and instead accept explicit props.

## Data Flow

1. Home screen reads `uid` from `useAuth()`.
2. A home loader fetches:
   - `getUserStats(uid)` for `currentStreak` and `totalMinutes`
   - `getUserActivities(uid)` for `totalActivities`
3. The loader maps raw results into a narrow view model for the home cards.
4. Pull-to-refresh re-runs the same loader and also rotates the affirmation.

## UI Behavior

- `HeroSwiper` shows the real total active minutes from the synced data.
- `StreakFlipCard` shows the real current streak.
- `NatureScoreFlipCard` shows the real total minutes and total session count.
- While data is loading, the cards render safe placeholder values instead of mock values.
- If the fetch fails, the screen stays usable and a toast explains that dashboard stats could not be refreshed.

## Deferred Items

- Longest streak is not currently exposed by the existing profile helpers, so this change will not attempt to derive historical personal-best streaks from raw activities.
- The leaderboard remains mock-backed in this pass.
- Affirmations remain mock-backed in this pass.

## Testing Strategy

- Extract pure formatting and derivation helpers where useful and cover them with a lightweight unit test.
- Verify the integrated screen with `bunx tsc --noEmit` and `bunx expo lint`.
