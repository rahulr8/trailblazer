---
phase: 03-home-screen
plan: 02
subsystem: ui
tags: [react-native, expo, heroui-native, expo-linear-gradient, flatlist, expo-router]

# Dependency graph
requires:
  - phase: 01-mock-data
    provides: MOCK_HERO_CARDS, MOCK_LEADERBOARD_FRIENDS, MOCK_LEADERBOARD_GLOBAL types and data
  - phase: 02-navigation
    provides: Expo Router tab navigation structure and theme context
provides:
  - HeroSwiper component with gradient motivation card and minutes counter
  - LeaderboardPreview component with Friends/Global toggle and top 5 rankings
affects: [03-home-screen-plan-03, home-screen-assembly]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - FlatList viewability tracking with stable refs (useRef + useCallback)
    - LinearGradient type assertion for readonly tuple colors
    - HeroUI Avatar with Image + Fallback pattern
    - Page indicator dots synced to scroll position

key-files:
  created:
    - components/home/HeroSwiper.tsx
    - components/home/LeaderboardPreview.tsx
  modified: []

key-decisions:
  - "Used snapToInterval + decelerationRate='fast' instead of pagingEnabled for cross-platform snap behavior"
  - "LinearGradient colors requires type assertion as readonly [ColorValue, ColorValue, ...ColorValue[]]"
  - "Leaderboard time formatted as hours only (Math.floor(totalTime / 60))"
  - "Current user row highlighted with accent + '15' hex opacity (~8% tint)"

patterns-established:
  - "FlatList pagination: viewabilityConfig as useRef, onViewableItemsChanged as useCallback for stable references"
  - "Avatar fallback: compute initials from displayName.split(' ').map(word => word[0])"
  - "Pill toggle: active pill has colored background, inactive is transparent"

# Metrics
duration: 2.7min
completed: 2026-01-27
---

# Phase 03 Plan 02: Home Screen Components Summary

**Horizontal hero swiper with gradient motivation card + counter, and Friends/Global leaderboard with top 5 rankings and View All navigation**

## Performance

- **Duration:** 2.7 min
- **Started:** 2026-01-27T19:00:00Z
- **Completed:** 2026-01-27T19:02:42Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- HeroSwiper with gradient motivation card and minutes active counter in horizontal FlatList
- Page indicator dots tracking scroll position with viewability API
- LeaderboardPreview with Friends/Global pill toggle switching between data sources
- Top 5 leaderboard entries with avatar, rank, name, and formatted time
- Current user row highlight with accent background tint
- View All button navigating to squad tab

## Task Commits

Each task was committed atomically:

1. **Task 1: Create HeroSwiper horizontal card component with gradient and dots** - `f9a07f0` (feat)
2. **Task 2: Create LeaderboardPreview with Friends/Global toggle and View All** - `36e4f7b` (feat)

## Files Created/Modified

- `components/home/HeroSwiper.tsx` - Horizontal 2-card swiper with gradient motivation card (nature-themed accent gradient, white text, refresh button) and minutes active counter card (formatted hours+minutes). Page indicator dots below track scroll position via viewability API.
- `components/home/LeaderboardPreview.tsx` - Friends/Global pill toggle switches between mock data sources, shows top 5 entries with HeroUI Avatar, rank, name, and time. Current user row highlighted with accent tint. View All button navigates to squad tab.

## Decisions Made

1. **FlatList pagination approach:** Used `snapToInterval` with `decelerationRate="fast"` instead of `pagingEnabled` for consistent cross-platform snap behavior with custom card widths
2. **LinearGradient type assertion:** `gradients.accent.colors` typed as `readonly string[]` but LinearGradient expects `readonly [ColorValue, ColorValue, ...ColorValue[]]` tuple - used type assertion to satisfy TypeScript
3. **Viewability tracking stability:** `viewabilityConfig` as `useRef`, `onViewableItemsChanged` as `useCallback` to avoid FlatList re-render warnings about changing references
4. **Leaderboard time formatting:** Display hours only via `Math.floor(entry.totalTime / 60) + 'h'` for compact leaderboard preview (full time shown in detail view)
5. **Current user highlight:** Accent color with `'15'` hex opacity appended (`${colors.accent}15`) for ~8% background tint

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript error: LinearGradient colors type mismatch**
- **Issue:** `gradients.accent.colors` is `readonly string[]` but LinearGradient expects `readonly [ColorValue, ColorValue, ...ColorValue[]]` tuple
- **Resolution:** Type assertion `as readonly [ColorValue, ColorValue, ...ColorValue[]]` on colors prop
- **Alternative considered:** Spreading array `[...gradients.accent.colors]` creates mutable array, doesn't satisfy tuple requirement

**FlatList getItemLayout type mismatch**
- **Issue:** TypeScript expected `ArrayLike<MockHeroCard>` parameter, not `MockHeroCard[]`
- **Resolution:** Changed parameter type to `ArrayLike<MockHeroCard> | null | undefined`

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Both home screen components ready for integration:
- HeroSwiper accepts `onRefreshMotivation` callback and `motivationText` prop for parent-managed affirmation state
- LeaderboardPreview self-contained with navigation to squad tab
- Both components use mock data - ready for Firebase integration in later phase
- All components theme-aware via useTheme hook

Ready for Plan 03 to build FlipCard animation component and assemble full Home screen.

---
*Phase: 03-home-screen*
*Completed: 2026-01-27*
