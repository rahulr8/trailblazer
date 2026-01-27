---
phase: 02-navigation-layout
plan: 01
subsystem: navigation
tags: [material-top-tabs, expo-router, fab, reanimated, modal, swipe-navigation]
requires:
  - phase: 01-mock-data-layer
    provides: TypeScript interfaces and mock data
provides:
  - 3-tab navigation shell with swipeable horizontal slide animations
  - ParkerFAB component with spring entrance animation
  - Profile modal route (moved from tab)
affects:
  - 02-02 (TopBar component renders inside this tab structure)
  - 02-03 (stub buttons render inside tab screens)
  - All future phases (screen content renders inside tab layout)
tech-stack:
  added:
    - "@react-navigation/material-top-tabs@7.4.13"
    - "react-native-tab-view@4.2.2"
    - "react-native-pager-view@8.0.0"
  patterns:
    - "Material Top Tabs at bottom via withLayoutContext for Expo Router compatibility"
    - "ParkerFAB as sibling overlay to tab navigator"
    - "Profile as modal route instead of tab"
key-files:
  created:
    - "components/navigation/ParkerFAB.tsx"
    - "app/(tabs)/stash.tsx"
    - "app/(tabs)/squad.tsx"
    - "app/(modals)/profile.tsx"
  modified:
    - "app/(tabs)/_layout.tsx"
    - "app/(modals)/_layout.tsx"
    - "app/CLAUDE.md"
    - "components/CLAUDE.md"
    - "package.json"
key-decisions:
  - "Used Material Top Tabs with tabBarPosition=bottom instead of custom tab layout for built-in swipe+slide"
  - "Dropped BlurView tab bar background (not supported by Material Top Tabs) in favor of solid backgroundColor"
  - "Profile modal uses presentation=modal with slide_from_bottom, overriding the default transparentModal in modals group"
patterns-established:
  - "withLayoutContext pattern: wrapping third-party navigators for Expo Router file-based routing"
  - "FAB overlay pattern: absolutely positioned component as sibling to navigator inside flex container"
duration: 4min
completed: 2026-01-27
---

# Phase 2 Plan 1: Tab Bar Restructure, Parker FAB, and Profile Modal Summary

**3-tab Material Top Tabs at bottom with swipe gestures, ParkerFAB overlay, and Profile moved to modal route**

## Performance
- **Duration:** 4min
- **Started:** 2026-01-27T18:31:42Z
- **Completed:** 2026-01-27T18:36:00Z
- **Tasks:** 2
- **Files modified:** 9 (4 created, 2 modified, 3 deleted)

## Accomplishments
- Replaced 4-tab Expo Router Tabs layout with 3-tab Material Top Tabs at bottom (Home, Your Stash, Your Squad)
- Enabled swipe gestures between tabs with horizontal slide animation
- Created ParkerFAB component with spring entrance animation (PawPrint icon, navigates to /chat)
- Moved Profile from tab screen to modal route with X dismiss button and slide_from_bottom animation
- Created placeholder screens for Your Stash and Your Squad tabs
- Removed old explore.tsx, rewards.tsx, and profile.tsx tab screens

## Task Commits
1. **Task 1: Install Material Top Tabs dependencies and create ParkerFAB** - `2d5d9c2` (feat)
2. **Task 2: Restructure tabs, create placeholder screens, move Profile to modal** - `1cedcc9` (feat)
3. **CLAUDE.md updates** - `f9510b5` (docs)

**Plan metadata:** (see final commit)

## Files Created/Modified
- `components/navigation/ParkerFAB.tsx` - FAB with PawPrint icon, spring animation, /chat navigation
- `app/(tabs)/_layout.tsx` - Rewritten to use Material Top Tabs with withLayoutContext
- `app/(tabs)/stash.tsx` - Your Stash placeholder screen
- `app/(tabs)/squad.tsx` - Your Squad placeholder screen
- `app/(modals)/profile.tsx` - Profile screen moved from tab with dismiss button
- `app/(modals)/_layout.tsx` - Added profile Stack.Screen with modal presentation
- `package.json` - Added material-top-tabs, tab-view, pager-view dependencies
- `app/CLAUDE.md` - Updated route structure documentation
- `components/CLAUDE.md` - Added ParkerFAB documentation

## Decisions Made
1. **Material Top Tabs over custom tab layout** - Used `@react-navigation/material-top-tabs` with `tabBarPosition="bottom"` because it provides swipe gestures and horizontal slide animation out of the box, avoiding hundreds of lines of custom gesture handling
2. **Dropped BlurView from tab bar** - Material Top Tabs does not support `tabBarBackground` prop (a Bottom Tabs feature). Using solid `colors.tabBarBackground` instead. Can revisit with custom tab bar wrapper if blur is needed
3. **Profile modal presentation override** - The `(modals)` group defaults to `transparentModal` with `fade`, but Profile uses `presentation: "modal"` with `slide_from_bottom` to appear as a card modal with opaque background, matching the CONTEXT.md requirement

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed tabBarIconStyle (not a valid Material Top Tab option)**
- **Found during:** Task 2 verification
- **Issue:** `tabBarIconStyle` does not exist on `MaterialTopTabNavigationOptions`, causing TypeScript error
- **Fix:** Removed the property from screenOptions
- **Files modified:** `app/(tabs)/_layout.tsx`

**2. [Rule 1 - Bug] Added explicit type annotations for tabBarIcon color parameter**
- **Found during:** Task 2 verification
- **Issue:** `color` in `tabBarIcon: ({ color })` had implicit `any` type in strict TypeScript
- **Fix:** Added `{ color: string }` type annotation to all three tab icon callbacks
- **Files modified:** `app/(tabs)/_layout.tsx`

**3. [Rule 3 - Blocking] Removed BlurView tabBarBackground (unsupported by Material Top Tabs)**
- **Found during:** Task 2 verification
- **Issue:** `tabBarBackground` is a Bottom Tabs option, not available on Material Top Tabs Navigator
- **Fix:** Removed `tabBarBackground` and `BlurView` import; use `backgroundColor` in `tabBarStyle` instead
- **Files modified:** `app/(tabs)/_layout.tsx`

## Issues Encountered
None beyond the type errors caught during verification.

## Next Phase Readiness
- Tab structure is complete and ready for Plan 02-02 (TopBar component) and 02-03 (stub action buttons)
- `haptic-tab.tsx` component is no longer used (was specific to Bottom Tabs `tabBarButton` prop) but kept in codebase for potential future use
- Home screen (`index.tsx`) was NOT modified per plan instructions -- will be updated in Plans 02-02 and 02-03

---
*Phase: 02-navigation-layout*
*Completed: 2026-01-27*
