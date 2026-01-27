---
phase: 02-navigation-layout
plan: 03
subsystem: ui-actions
tags: [toast, heroui-native, stub-buttons, ux-polish]
requires:
  - phase: 02-navigation-layout
    provides: Tab navigation shell with Home and Squad screens
provides:
  - Inline "Add Activity" stub button on Home screen with Coming Soon toast
  - "Add Friend" header button on Squad screen with Coming Soon toast
affects:
  - phase: 03-home-screen
    impact: Add Activity button position may be relocated when real Home content is built
  - phase: 04-stash-squad
    impact: Add Friend button will be wired to real friend invite flow
tech-stack:
  added: []
  patterns:
    - useToast hook from HeroUI Native for toast notifications
    - useCallback for stable press handler references
key-files:
  created: []
  modified:
    - app/(tabs)/index.tsx
    - app/(tabs)/squad.tsx
key-decisions:
  - Used HeroUI Native built-in Toast (useToast hook + toast.show config pattern) for consistent UI
  - Placed Add Activity button as inline Pressable with accent color at 15% opacity background
  - Used header row layout (title left, action right) for Squad Add Friend button
duration: 2min
completed: 2026-01-27
---

# Phase 02 Plan 03: Stub Action Buttons Summary

**Add Coming Soon stub buttons to Home and Squad screens using HeroUI Native Toast.**

## Performance

- Duration: ~2 minutes
- Tasks: 2/2 completed
- Deviations: 0

## Accomplishments

1. Added inline "+" Add Activity button to Home screen below the title, styled with accent color at 15% opacity background and accent text
2. Added "Add Friend" text button right-aligned in Squad screen header row alongside the "Your Squad" title
3. Both buttons show HeroUI Native Toast with "Coming Soon" label and descriptive message on tap
4. Used `useToast` hook from HeroUI Native (provided by `HeroUINativeProvider` -> `ToastProvider` already in app provider hierarchy)

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add "+" button to Home screen with Coming Soon toast | 4d92eca | app/(tabs)/index.tsx |
| 2 | Add "Add Friend" button to Squad screen header with Coming Soon toast | 07b141e | app/(tabs)/squad.tsx |

## Files Modified

- `app/(tabs)/index.tsx` -- Added useToast hook, handleAddActivity callback, Pressable "Add Activity" button with Plus icon, and addActivityButton/addActivityText styles
- `app/(tabs)/squad.tsx` -- Added useToast hook, handleAddFriend callback, header row layout with "Add Friend" Pressable text button, headerRow and addFriendText styles

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Used `useToast` hook (not static `Toast.show()`) | HeroUI Native exposes toast via context hook pattern; `ToastProvider` already wrapped in `HeroUINativeProvider` |
| Inline Pressable for Add Activity (not HeroUI Button) | Matches plan spec for lightweight styled button with custom accent background opacity |
| `useCallback` for handlers | Stable references prevent unnecessary re-renders of Pressable children |
| Accent color at 15% opacity (`colors.accent + "15"`) | Consistent with existing patterns in codebase (e.g., `colors.accent + "20"` in chat.tsx) |

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript error in `components/ActivitySourceCard.tsx` (route type mismatch) -- not related to this plan, not addressed.

## Next Phase Readiness

- Home screen Add Activity button is a placeholder -- Phase 3 will build real Home content and may reposition or replace this button
- Squad screen Add Friend button is a placeholder -- Phase 4 will build real Squad functionality
- Toast infrastructure (useToast) now proven and available for any screen
