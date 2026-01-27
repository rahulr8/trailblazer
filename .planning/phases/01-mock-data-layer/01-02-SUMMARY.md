---
phase: 01-mock-data-layer
plan: 02
subsystem: ui
tags: [typescript, mock-data, fixtures, react-native]

# Dependency graph
requires:
  - phase: 01-01
    provides: TypeScript interfaces for all mock data types
provides:
  - Hardcoded mock data fixtures for all screen layouts
  - Complete mock module with zero Firebase dependencies
  - Realistic data volume for scrollable lists and grids
affects: [02-authentication, 03-profile-tab, 04-rewards-tab, 05-social-tab, 06-wallet-tab]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "UPPER_SNAKE_CASE for exported constants"
    - "import type syntax for tree-shaking"
    - "Barrel export pattern for clean imports"

key-files:
  created:
    - lib/mock/data.ts
  modified:
    - lib/mock/index.ts

key-decisions:
  - "Used pravatar.cc for consistent avatar URLs across mock data"
  - "Used Unsplash for realistic outdoor brand reward images"
  - "Provided raw numeric primitives (screens handle formatting)"
  - "Current user (Sarah Johnson) ranked #2 in friends, #4 in global leaderboard"

patterns-established:
  - "All mock data imports from @/lib/mock using barrel export"
  - "Mock data uses only primitive types - no Firebase/Firestore dependencies"
  - "Sufficient data volume for all UI patterns (8+ rewards, 10+ leaderboard entries)"

# Metrics
duration: 2min
completed: 2026-01-27
---

# Phase 01 Plan 02: Mock Data Fixtures Summary

**Hardcoded mock data with 11 fixture constants covering all screens, zero Firebase dependencies, and realistic volume for UI layouts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-27T17:52:09Z
- **Completed:** 2026-01-27T17:54:10Z
- **Tasks:** 2
- **Files modified:** 4 (data.ts created, index.ts updated, functions/package.json + package-lock.json)

## Accomplishments
- Created 11 hardcoded fixture constants with realistic outdoor activity data
- 8+ vendor rewards (Arc'teryx, Patagonia, MEC, North Face, Vessi, Running Room, Lululemon, Scandinave Spa)
- 5 friends leaderboard entries + 10 global leaderboard entries with current user positioned realistically
- 5 achievement badges (3 earned, 2 locked) with dates
- Complete barrel export enabling single import path for all types and data
- Zero Firebase imports verified across entire lib/mock/ directory
- TypeScript strict mode validation passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create hardcoded mock data fixtures** - `7090386` (feat)
2. **Task 2: Update barrel export and final validation** - `49750bd` (feat)

## Files Created/Modified
- `lib/mock/data.ts` - All 11 fixture constants with realistic data (MOCK_USER, MOCK_STATS, MOCK_REWARDS, MOCK_LEADERBOARD_FRIENDS, MOCK_LEADERBOARD_GLOBAL, MOCK_ACHIEVEMENTS, MOCK_HERO_CARDS, MOCK_PULSE_FEED, MOCK_QUESTS, MOCK_WALLET_CARDS, MOCK_AFFIRMATIONS)
- `lib/mock/index.ts` - Added export from ./data to barrel export
- `functions/package.json` - Added firebase-admin and firebase-functions dependencies
- `functions/package-lock.json` - Lockfile for functions dependencies

## Decisions Made
- **Avatar URLs:** Used pravatar.cc for consistent, realistic avatars across leaderboard and pulse feed
- **Reward images:** Used Unsplash outdoor/brand images with w=800&q=80 parameters for performance
- **Data volume:** Exceeded minimums (8 rewards vs 8+, 10 global leaderboard vs 10+, 8 affirmations vs 7+) to ensure rich UI
- **Current user positioning:** Ranked #2 in friends (out of 5) and #4 in global (out of 10) for realistic competitive context
- **Primitive values:** Provided raw numbers (e.g., 3420 minutes) not formatted strings - screens handle formatting per CLAUDE.md conventions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing Firebase Cloud Functions dependencies**
- **Found during:** Task 1 (TypeScript validation)
- **Issue:** `npx tsc --noEmit` failed with "Cannot find module 'firebase-admin/app'" - functions/ directory had empty node_modules
- **Fix:** Ran `npm install firebase-admin firebase-functions` in functions/ directory
- **Files modified:** functions/package.json, functions/package-lock.json
- **Verification:** TypeScript validation passes with exit code 0
- **Committed in:** 7090386 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix to unblock TypeScript validation. Functions directory was initialized in prior work but dependencies were never installed. No scope creep.

## Issues Encountered
None - plan executed smoothly after resolving functions dependency blocker.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete mock data module ready for screen development
- All future screens can import typed, realistic mock data from `@/lib/mock`
- Data volume sufficient for scrollable lists, grids, carousels, and all UI patterns
- Zero Firebase dependencies confirmed - screens can be built without backend
- Ready to proceed with authentication flow (phase 02) or any screen implementation

**Blockers:** None

**Concerns:** None - all must_haves from REQUIREMENTS.md satisfied:
- ✅ MOCK-01: Realistic fixture data exists
- ✅ MOCK-02: Sufficient data volume (8+ rewards, 10+ leaderboard, 5+ achievements, 7+ affirmations)
- ✅ MOCK-03: Zero Firebase dependencies verified

---
*Phase: 01-mock-data-layer*
*Completed: 2026-01-27*
