# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-27)

**Core value:** Every screen matches wireframe designs, feels native, and mock data cleanly separates from future backend.
**Current focus:** Phase 3 - Home Screen (in progress)

## Current Position

Phase: 3 of 6 (Home Screen)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-01-27 -- Completed 03-01-PLAN.md

Progress: [████████░░░░░░░░░░░░] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 2.7min
- Total execution time: 0.26 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-mock-data-layer | 2/2 | 3min | 1.5min |
| 02-navigation-layout | 3/3 | 11min | 3.7min |
| 03-home-screen | 1/3 | 4min | 4.0min |

**Recent Trend:**
- Last 5 plans: 2min, 4min, 2min, 5min, 4min
- Trend: Steady

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Mock data layer comes first so all screens import from `@/lib/mock` with zero Firebase dependencies
- Reanimated 4 requires New Architecture enabled + react-native-worklets (already installed)
- Android requires `{ perspective: 1000 }` as FIRST transform in array for 3D effects
- All dates stored as ISO 8601 strings (not Firebase Timestamp) for UI layer (01-01)
- String literal unions for discriminated fields (membershipTier, rewardType, type) (01-01)
- Used pravatar.cc for consistent avatar URLs across mock data (01-02)
- Used Unsplash for realistic outdoor brand reward images (01-02)
- Provided raw numeric primitives in mock data - screens handle formatting (01-02)
- Used Material Top Tabs with tabBarPosition=bottom for swipe+slide instead of custom layout (02-01)
- Dropped BlurView tab bar background -- not supported by Material Top Tabs, using solid backgroundColor (02-01)
- Profile modal uses presentation=modal with slide_from_bottom, overriding transparentModal default (02-01)
- Used HeroUI Native useToast hook for Coming Soon toasts -- ToastProvider already in HeroUINativeProvider hierarchy (02-03)
- HeroUI Avatar requires alt prop for accessibility (02-02)
- Each tab manages independent affirmation state, not shared global (02-02)
- Home screen simplified to placeholder for Phase 2 -- Firebase/Health imports removed, will rebuild in Phase 3 (02-02)
- No tap affordance visual hint on flip cards - discovery-based interaction is common mobile pattern (03-01)
- Nature Score calculation uses simple mock formula (totalMinutes * 0.05) - real algorithm deferred (03-01)

### Pending Todos

None yet.

### Blockers/Concerns

- HeroUI Native 1.0.0-beta.9 is in beta -- monitor for API changes or bugs during development
- Digital wallet 3D stack animation (v2 scope) has no official pattern; will need prototyping if added
- haptic-tab.tsx is no longer used (Bottom Tabs specific) but kept in codebase -- consider removing if not needed

## Session Continuity

Last session: 2026-01-28T00:55:08Z
Stopped at: Completed 03-01-PLAN.md (FlipCard components)
Resume file: None
